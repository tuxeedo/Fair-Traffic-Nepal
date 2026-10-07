import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from violations.models import SafetyScore, Violation, SafetyScoreHistory

class Command(BaseCommand):
    help = 'Award good behavior points to drivers with no recent violations.'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        six_months_ago = now - datetime.timedelta(days=180)
        one_year_ago = now - datetime.timedelta(days=365)

        scores = SafetyScore.objects.all()
        awarded_count = 0

        for score in scores:
            if score.current_score >= 100:
                continue

            # Get latest violation
            latest_violation = Violation.objects.filter(driver=score.driver).order_by('-created_at').first()
            if not latest_violation:
                continue
            
            last_violation_date = latest_violation.created_at

            # Check if we already awarded points recently (in the last 6 months)
            recent_reward = SafetyScoreHistory.objects.filter(
                driver=score.driver,
                reason__icontains='good behavior',
                created_at__gte=six_months_ago
            ).exists()

            if recent_reward:
                continue

            if last_violation_date <= one_year_ago:
                score.award_points(5, '1 Year Good Behavior (No violations)')
                awarded_count += 1
            elif last_violation_date <= six_months_ago:
                score.award_points(3, '6 Months Good Behavior (No violations)')
                awarded_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully awarded good behavior points to {awarded_count} drivers.'))
