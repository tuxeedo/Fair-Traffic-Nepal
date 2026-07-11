from django.db import models
from django.conf import settings


class Appeal(models.Model):
    """
    Citizen appeal against a traffic violation.
    Every action (submit, review) is audited.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        UNDER_REVIEW = 'under_review', 'Under Review'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'

    violation = models.OneToOneField(
        'violations.Violation',
        on_delete=models.CASCADE,
        related_name='appeal',
    )
    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appeals_submitted',
    )
    reason = models.TextField(help_text='Reason for the appeal')
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    admin_remarks = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='appeals_reviewed',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Appeal #{self.pk} for violation #{self.violation_id} — {self.get_status_display()}"


class Complaint(models.Model):
    """
    Citizen complaint against an officer.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        UNDER_INVESTIGATION = 'under_investigation', 'Under Investigation'
        RESOLVED = 'resolved', 'Resolved'
        DISMISSED = 'dismissed', 'Dismissed'

    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='complaints_filed',
    )
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='complaints_received',
    )
    violation = models.ForeignKey(
        'violations.Violation',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='complaints',
    )
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    admin_remarks = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='complaints_reviewed',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Complaint #{self.pk} by {self.citizen} against {self.officer}"
