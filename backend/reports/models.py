from django.db import models
from django.conf import settings


class CommunityReport(models.Model):
    """
    Reports submitted by citizens for road conditions, hazards, etc.
    Reports remain Pending until approved by an officer or admin.
    """

    class ReportType(models.TextChoices):
        PARKING_SUGGESTION = 'parking_suggestion', 'Parking Suggestion'
        ROAD_HAZARD = 'road_hazard', 'Road Hazard'
        BROKEN_TRAFFIC_LIGHT = 'broken_traffic_light', 'Broken Traffic Light'
        CONSTRUCTION = 'construction', 'Road Construction'
        ACCIDENT = 'accident', 'Accident Report'
        MISSING_SIGN = 'missing_sign', 'Missing Traffic Sign'
        POTHOLE = 'pothole', 'Pothole'
        FLOODING = 'flooding', 'Road Flooding'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='community_reports',
    )
    report_type = models.CharField(max_length=25, choices=ReportType.choices)
    title = models.CharField(max_length=200)
    description = models.TextField()
    gps_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    gps_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to='reports/%Y/%m/%d/', blank=True, null=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reports_reviewed',
    )
    review_remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_report_type_display()}: {self.title} ({self.get_status_display()})"
