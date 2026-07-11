from django.db import models
from django.conf import settings


class ViolationType(models.Model):
    """
    Catalog of possible violation types.
    Admin can add/modify these without code changes.
    """

    class Category(models.TextChoices):
        MINOR = 'minor', 'Minor'
        MAJOR = 'major', 'Major'
        DANGEROUS = 'dangerous', 'Dangerous'

    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True, help_text='Short code, e.g. NO_HELMET')
    category = models.CharField(max_length=10, choices=Category.choices, default=Category.MINOR)
    base_fine_amount = models.DecimalField(max_digits=10, decimal_places=2)
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
    action_taken = models.CharField(max_length=10, choices=ActionTaken.choices)
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
