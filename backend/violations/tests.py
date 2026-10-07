from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from .models import ViolationType, TrafficRule, Violation, SafetyScore
from .rule_engine import evaluate_violation, update_safety_score, restore_safety_score

User = get_user_model()


class RuleEngineTestCase(TestCase):
    def setUp(self):
        # Create users
        self.driver = User.objects.create_user(
            username='testdriver',
            email='testdriver@example.com',
            password='testpassword',
            first_name='Test',
            last_name='Driver',
            role='citizen',
        )
        self.officer = User.objects.create_user(
            username='testofficer',
            email='testofficer@example.com',
            password='testpassword',
            first_name='Test',
            last_name='Officer',
            role='officer',
        )

        # Create ViolationType (helmet)
        self.no_helmet = ViolationType.objects.create(
            name='No Helmet',
            code='NO_HELMET',
            category='minor',
            base_fine_amount=500,
            score_deduction=5,
        )

        # Rules for helmet:
        # Offense 1: warning (180 days window)
        # Offense 2: fine of 500 (180 days window)
        self.rule_1 = TrafficRule.objects.create(
            violation_type=self.no_helmet,
            offense_number=1,
            time_window_days=180,
            action='warning',
            fine_amount=0,
            description='First warning',
        )
        self.rule_2 = TrafficRule.objects.create(
            violation_type=self.no_helmet,
            offense_number=2,
            time_window_days=180,
            action='fine',
            fine_amount=500,
            description='Second fine',
        )

    def test_first_offense_recommends_warning(self):
        res = evaluate_violation(self.driver, self.no_helmet)
        self.assertEqual(res['action'], 'warning')
        self.assertEqual(res['fine_amount'], 0)
        self.assertEqual(res['offense_number'], 1)
        self.assertEqual(res['rule_applied'], self.rule_1)

    def test_second_offense_recommends_fine(self):
        # Record first violation
        Violation.objects.create(
            driver=self.driver,
            officer=self.officer,
            violation_type=self.no_helmet,
            action_taken='warning',
            fine_amount=0,
        )

        # Evaluate second
        res = evaluate_violation(self.driver, self.no_helmet)
        self.assertEqual(res['action'], 'fine')
        self.assertEqual(res['fine_amount'], 500)
        self.assertEqual(res['offense_number'], 2)
        self.assertEqual(res['rule_applied'], self.rule_2)

    def test_safety_score_calculation(self):
        # Initial score
        score_obj = SafetyScore.objects.create(driver=self.driver, current_score=100)

        # Create warning violation
        violation = Violation.objects.create(
            driver=self.driver,
            officer=self.officer,
            violation_type=self.no_helmet,
            action_taken='warning',
            fine_amount=0,
        )

        # Update score with fine
        score_obj = update_safety_score(self.driver, violation, 'fine')
        self.assertEqual(score_obj.current_score, 95)  # 100 - 5 (minor fine delta)

        # Create fine violation
        violation_fine = Violation.objects.create(
            driver=self.driver,
            officer=self.officer,
            violation_type=self.no_helmet,
            action_taken='fine',
            fine_amount=500,
        )
        score_obj = update_safety_score(self.driver, violation_fine, 'fine')
        self.assertEqual(score_obj.current_score, 90)  # 95 - 5 (minor fine delta)

        # Restore fine violation points on appeal
        restore_safety_score(self.driver, violation_fine)
        score_obj.refresh_from_db()
        self.assertEqual(score_obj.current_score, 95)  # restored 5 points
