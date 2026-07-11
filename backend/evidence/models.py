from django.db import models
from django.conf import settings


class Evidence(models.Model):
    """
    Evidence attached to a violation.
    Officers upload photos/videos when recording violations.
    Citizens can also upload supporting evidence for appeals.
    """

    class EvidenceType(models.TextChoices):
        PHOTO = 'photo', 'Photo'
        VIDEO = 'video', 'Video'
        DOCUMENT = 'document', 'Document'

    class Source(models.TextChoices):
        OFFICER = 'officer', 'Uploaded by Officer'
        CITIZEN = 'citizen', 'Uploaded by Citizen (Appeal)'

    violation = models.ForeignKey(
        'violations.Violation',
        on_delete=models.CASCADE,
        related_name='evidence_files',
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_evidence',
    )
    file = models.FileField(upload_to='evidence/%Y/%m/%d/')
    evidence_type = models.CharField(
        max_length=10,
        choices=EvidenceType.choices,
        default=EvidenceType.PHOTO,
    )
    source = models.CharField(
        max_length=10,
        choices=Source.choices,
        default=Source.OFFICER,
    )
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name_plural = 'Evidence'

    def __str__(self):
        return f"{self.get_evidence_type_display()} for violation #{self.violation_id}"
