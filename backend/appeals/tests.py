from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from violations.models import ViolationType, Violation
from appeals.models import Appeal
from violations.models import SafetyScore, SafetyScoreHistory, TrafficRule
from violations.rule_engine import update_safety_score, evaluate_violation, restore_safety_score
from django.utils import timezone
from django.apps import apps
from django.db import connection
from importlib import import_module
from unittest.mock import patch
from types import SimpleNamespace

User = get_user_model()


class AppealWorkflowTestCase(TestCase):
    def setUp(self):
        self.citizen = User.objects.create_user(
            username='citizen_john',
            email='john@example.com',
            password='Password123!',
            first_name='John',
            last_name='Doe',
            role='citizen',
        )
        self.admin = User.objects.create_user(
            username='admin_boss',
            email='admin@example.com',
            password='Password123!',
            first_name='Admin',
            last_name='Boss',
            role='admin',
        )
        self.officer = User.objects.create_user(
            username='officer_sam',
            email='sam@example.com',
            password='Password123!',
            first_name='Sam',
            last_name='Officer',
            role='officer',
        )

        self.violation_type = ViolationType.objects.create(
            name='Speeding',
            code='SPEEDING_01',
            category='moderate',
            base_fine_amount=1500,
            score_deduction=5,
        )

        self.violation = Violation.objects.create(
            driver=self.citizen,
            officer=self.officer,
            violation_type=self.violation_type,
            action_taken='fine',
            fine_amount=1500,
            is_paid=False,
        )

        self.citizen_client = APIClient()
        self.citizen_client.force_authenticate(user=self.citizen)

        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)

    def test_two_tier_appeal_workflow(self):
        # 1. Citizen submits initial appeal
        response = self.citizen_client.post('/api/v1/appeals/submit/', {
            'violation': self.violation.id,
            'reason': 'I was driving an emergency medical case.',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        appeal_id = response.data['id']

        appeal = Appeal.objects.get(id=appeal_id)
        self.assertEqual(appeal.appeal_count, 1)
        self.assertEqual(appeal.status, Appeal.Status.PENDING)

        # 2. Admin performs 1st rejection
        rev_res = self.admin_client.post(f'/api/v1/appeals/{appeal_id}/review/', {
            'action': 'rejected',
            'admin_remarks': 'Insufficient proof provided.',
        })
        self.assertEqual(rev_res.status_code, status.HTTP_200_OK)

        appeal.refresh_from_db()
        self.assertEqual(appeal.appeal_count, 1)
        self.assertEqual(appeal.status, Appeal.Status.REJECTED)

        # 3. Citizen submits 2nd appeal (Re-appeal)
        re_res = self.citizen_client.post('/api/v1/appeals/submit/', {
            'violation': self.violation.id,
            'reason': 'Attached official medical hospital admission certificate.',
        })
        self.assertEqual(re_res.status_code, status.HTTP_200_OK)

        appeal.refresh_from_db()
        self.assertEqual(appeal.appeal_count, 1)  # Count remains 1 until 2nd rejection
        self.assertEqual(appeal.status, Appeal.Status.PENDING)

        # 4. Admin performs 2nd rejection (Final Rejection)
        rev_res2 = self.admin_client.post(f'/api/v1/appeals/{appeal_id}/review/', {
            'action': 'rejected',
            'admin_remarks': 'Hospital certificate expired/invalid.',
        })
        self.assertEqual(rev_res2.status_code, status.HTTP_200_OK)

        appeal.refresh_from_db()
        self.assertEqual(appeal.appeal_count, 2)
        self.assertEqual(appeal.status, Appeal.Status.FINAL_REJECTED)

        # 5. Citizen attempts 3rd appeal -> blocked with validation error
        re_res3 = self.citizen_client.post('/api/v1/appeals/submit/', {
            'violation': self.violation.id,
            'reason': 'Third attempt.',
        })
        self.assertEqual(re_res3.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('final appeal has been reviewed and rejected', str(re_res3.data))

    def accept_appeal(self):
        appeal = Appeal.objects.create(violation=self.violation, citizen=self.citizen, reason='Incorrect record')
        response = self.admin_client.post(f'/api/v1/appeals/{appeal.id}/review/', {
            'action': 'accepted', 'admin_remarks': 'Evidence confirms the record is incorrect.',
        })
        self.assertEqual(response.status_code, 200)
        return appeal

    def test_acceptance_cancels_without_payment_and_restores_score_once(self):
        update_safety_score(self.citizen, self.violation, 'fine')
        appeal = self.accept_appeal()
        self.violation.refresh_from_db()
        self.assertFalse(self.violation.is_paid)
        self.assertIsNone(self.violation.paid_at)
        self.assertTrue(self.violation.is_cancelled)
        self.assertEqual(self.violation.fine_amount, 1500)  # original evidence retained
        self.assertEqual(SafetyScore.objects.get(driver=self.citizen).current_score, 100)
        restore_safety_score(self.citizen, self.violation)
        self.assertEqual(SafetyScoreHistory.objects.filter(violation=self.violation, score_change__gt=0).count(), 1)
        duplicate = self.admin_client.post(f'/api/v1/appeals/{appeal.id}/review/', {'action': 'accepted', 'admin_remarks': 'Again'})
        self.assertEqual(duplicate.status_code, 400)
        record = self.citizen_client.get('/api/v1/violations/my/').data['results'][0]
        self.assertTrue(record['is_cancelled'])
        self.assertEqual(record['payment_status'], 'cancelled')
        self.assertEqual(record['fine_due'], '0.00')
        self.assertEqual(self.citizen_client.post(f'/api/v1/violations/{self.violation.id}/pay/', {}).status_code, 400)

    def test_cancelled_cases_do_not_count_in_policy_or_analytics(self):
        TrafficRule.objects.create(violation_type=self.violation_type, offense_number=1, action='warning', fine_amount=0)
        TrafficRule.objects.create(violation_type=self.violation_type, offense_number=2, action='fine', fine_amount=1500)
        self.accept_appeal()
        self.assertEqual(evaluate_violation(self.citizen, self.violation_type)['offense_number'], 1)
        summary = self.admin_client.get('/api/v1/analytics/dashboard/').data
        self.assertEqual(summary['total_violations'], 0)
        self.assertEqual(summary['unpaid_fines'], 0)
        self.assertEqual(summary['total_revenue'], '0')
        self.assertEqual(summary['cancelled_violations'], 1)
        for endpoint in ['daily-violations', 'monthly-violations', 'violations-by-type', 'top-offenders', 'heatmap']:
            self.assertEqual(self.admin_client.get(f'/api/v1/analytics/{endpoint}/').data, [])

    def test_rejection_keeps_fine_collectible(self):
        appeal = Appeal.objects.create(violation=self.violation, citizen=self.citizen, reason='Disputed')
        response = self.admin_client.post(f'/api/v1/appeals/{appeal.id}/review/', {'action': 'rejected', 'admin_remarks': 'Evidence supports the record'})
        self.assertEqual(response.status_code, 200)
        self.violation.refresh_from_db()
        self.assertFalse(self.violation.is_cancelled)
        self.assertEqual(self.citizen_client.post(f'/api/v1/violations/{self.violation.id}/pay/', {}).status_code, 200)

    def test_real_payment_history_survives_acceptance(self):
        paid_at = timezone.now()
        self.violation.is_paid = True
        self.violation.paid_at = paid_at
        self.violation.save()
        self.accept_appeal()
        self.violation.refresh_from_db()
        self.assertTrue(self.violation.is_paid)
        self.assertEqual(self.violation.paid_at, paid_at)
        self.assertTrue(self.violation.is_cancelled)

    def test_acceptance_restores_only_points_actually_deducted_at_floor(self):
        SafetyScore.objects.create(driver=self.citizen, current_score=2)
        update_safety_score(self.citizen, self.violation, 'fine')
        self.accept_appeal()
        self.assertEqual(SafetyScore.objects.get(driver=self.citizen).current_score, 2)

    def test_legacy_false_payment_is_repaired(self):
        self.violation.is_paid = True
        self.violation.save()
        self.accept_appeal()
        repair = import_module('appeals.migrations.0004_correct_accepted_appeal_payments')
        repair.correct_false_payments(apps, SimpleNamespace(connection=connection))
        self.violation.refresh_from_db()
        self.assertFalse(self.violation.is_paid)

    def test_review_rolls_back_when_audit_fails(self):
        update_safety_score(self.citizen, self.violation, 'fine')
        appeal = Appeal.objects.create(violation=self.violation, citizen=self.citizen, reason='Disputed')
        with patch('audit.models.AuditLog.objects.create', side_effect=RuntimeError('Audit failed')):
            with self.assertRaises(RuntimeError):
                self.admin_client.post(f'/api/v1/appeals/{appeal.id}/review/', {'action': 'accepted', 'admin_remarks': 'Accepted'})
        appeal.refresh_from_db()
        self.assertEqual(appeal.status, 'pending')
        self.assertEqual(SafetyScore.objects.get(driver=self.citizen).current_score, 95)
