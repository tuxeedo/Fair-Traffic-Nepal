from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from violations.models import ViolationType, Violation
from appeals.models import Appeal

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
