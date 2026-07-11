from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """
    Immutable audit trail for all significant actions in the system.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs',
    )
    action = models.CharField(max_length=100, help_text='e.g. violation_recorded, appeal_accepted')
    model_name = models.CharField(max_length=50, help_text='The model affected')
    object_id = models.CharField(max_length=50, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.user} — {self.action}"
