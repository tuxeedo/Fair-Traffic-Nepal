from django.db import models
from django.conf import settings


class Notification(models.Model):
    """User notification for violations, warnings, appeals, and reports."""

    class NotificationType(models.TextChoices):
        VIOLATION = 'violation', 'Violation'
        WARNING = 'warning', 'Warning'
        FINE = 'fine', 'Fine'
        APPEAL = 'appeal', 'Appeal Update'
        REPORT = 'report', 'Report Update'
        SYSTEM = 'system', 'System'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=10,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
    )
    is_read = models.BooleanField(default=False)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} → {self.user}"
