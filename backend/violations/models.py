from django.db import models
from django.conf import settings


class ViolationType(models.Model):
    """
    Catalog of possible violation types.
    Admin can add/modify these without code changes.
    """

    class Category(models.TextChoices):
        EDUCATIONAL = 'educational', 'Level 1 - Educational'
        MODERATE = 'moderate', 'Level 2 - Moderate'
        DANGEROUS = 'dangerous', 'Level 3 - Dangerous'
        CRITICAL = 'critical', 'Level 4 - Critical'

    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True, help_text='Short code, e.g. NO_HELMET')
    category = models.CharField(max_length=15, choices=Category.choices, default=Category.EDUCATIONAL)
    base_fine_amount = models.DecimalField(max_digits=10, decimal_places=2)
    score_deduction = models.PositiveIntegerField(default=0, help_text='Points to deduct from driver score')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = 'Violation Type'
        verbose_name_plural = 'Violation Types'

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class TrafficRule(models.Model):
    """
    Configurable rule tiers for each violation type.
    The rule engine uses these to determine whether to issue a warning or fine.
    Admins can modify rules through the UI — no code changes needed.
    """

    class Action(models.TextChoices):
        WARNING = 'warning', 'Warning'
        FINE = 'fine', 'Fine'
        INCREASED_FINE = 'increased_fine', 'Increased Fine'
        LICENSE_SUSPENSION = 'license_suspension', 'License Suspension'
        COMMUNITY_SERVICE = 'community_service', 'Community Service'

    violation_type = models.ForeignKey(
        ViolationType,
        on_delete=models.CASCADE,
        related_name='rules',
    )
    offense_number = models.PositiveIntegerField(
        help_text='Which offense this rule applies to (1 = first, 2 = second, etc.)',
    )
    time_window_days = models.PositiveIntegerField(
        default=180,
        help_text='Time window in days to count previous offenses (e.g. 180 = 6 months)',
    )
    action = models.CharField(max_length=20, choices=Action.choices)
    fine_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text='Fine amount for this tier. 0 for warnings.',
    )
    is_immediate = models.BooleanField(
        default=False,
        help_text='If True, skip offense counting — always apply this action.',
    )
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_rules',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['violation_type', 'offense_number']
        unique_together = ['violation_type', 'offense_number']
        verbose_name = 'Traffic Rule'
        verbose_name_plural = 'Traffic Rules'

    def __str__(self):
        return f"{self.violation_type.name} — Offense #{self.offense_number} → {self.get_action_display()}"


class Violation(models.Model):
    """
    A recorded traffic violation incident.
    Created by officers; links driver, vehicle, type, and enforcement action.
    """

    class ActionTaken(models.TextChoices):
        WARNING = 'warning', 'Warning'
        FINE = 'fine', 'Fine'
        COMMUNITY_SERVICE = 'community_service', 'Community Service'

    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='violations_received',
    )
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='violations',
    )
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='violations_issued',
    )
    violation_type = models.ForeignKey(
        ViolationType,
        on_delete=models.PROTECT,
        related_name='violations',
    )
    action_taken = models.CharField(max_length=20, choices=ActionTaken.choices)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    gps_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    gps_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    location_description = models.CharField(max_length=255, blank=True)
    officer_remarks = models.TextField(blank=True)
    rule_applied = models.ForeignKey(
        TrafficRule,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        help_text='The traffic rule that was applied by the rule engine.',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.pk} — {self.violation_type.name} → {self.get_action_taken_display()} ({self.driver})"


class Warning(models.Model):
    """Warning record linked to a violation."""

    violation = models.OneToOneField(
        Violation,
        on_delete=models.CASCADE,
        related_name='warning',
    )
    message = models.TextField(
        default='This is a formal warning. Repeated offenses will result in a fine.',
    )
    acknowledged = models.BooleanField(default=False)
    acknowledged_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Warning for violation #{self.violation_id}"


class SafetyScore(models.Model):
    """
    Driver safety score — starts at 100.
    Updated automatically by the rule engine.
    """

    driver = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='safety_score',
    )
    current_score = models.IntegerField(default=100)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.driver} — Score: {self.current_score}"

    def award_points(self, amount, reason):
        """Award points to the driver (e.g., good behavior, community service)."""
        previous_score = self.current_score
        max_score = getattr(settings, 'SAFETY_SCORE_MAX', 100)
        new_score = min(max_score, previous_score + amount)
        
        # Only log history if there is an actual change
        if new_score != previous_score:
            self.current_score = new_score
            self.save()
            SafetyScoreHistory.objects.create(
                driver=self.driver,
                score_change=new_score - previous_score,
                reason=reason,
                previous_score=previous_score,
                new_score=new_score,
                violation=None,
            )


class SafetyScoreHistory(models.Model):
    """Audit trail for safety score changes."""

    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='safety_score_history',
    )
    score_change = models.IntegerField(help_text='Positive or negative delta')
    reason = models.CharField(max_length=255)
    previous_score = models.IntegerField()
    new_score = models.IntegerField()
    violation = models.ForeignKey(
        Violation,
        on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Safety Score History'

    def __str__(self):
        change_str = f"+{self.score_change}" if self.score_change > 0 else str(self.score_change)
        return f"{self.driver} {change_str} ({self.reason})"


class Payment(models.Model):
    """Payment record for a fine."""
    violation = models.ForeignKey(
        Violation,
        on_delete=models.CASCADE,
        related_name='payments',
    )
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    transaction_id = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment of {self.amount_paid} for violation #{self.violation_id}"


class CommunityService(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'

    violation = models.OneToOneField(Violation, on_delete=models.CASCADE, related_name='community_service')
    driver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_services')
    assigned_hours = models.PositiveIntegerField()
    completed_hours = models.PositiveIntegerField(default=0)
    service_type = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.driver} - {self.completed_hours}/{self.assigned_hours} hrs"
