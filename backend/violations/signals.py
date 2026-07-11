"""
Signals for the violations app.
Creates notifications when violations are recorded.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Violation


@receiver(post_save, sender=Violation)
def notify_driver_on_violation(sender, instance, created, **kwargs):
    """Create a notification for the driver when a new violation is recorded."""
    if not created:
        return

    # Import here to avoid circular imports
    from notifications.models import Notification

    if instance.action_taken == 'warning':
        title = 'New Warning Issued'
        message = (
            f'You have received a warning for: {instance.violation_type.name}. '
            f'Location: {instance.location_description or "N/A"}. '
            f'Please be more careful to avoid future fines.'
        )
        notif_type = 'warning'
    else:
        title = 'Traffic Fine Issued'
        message = (
            f'You have been fined NPR {instance.fine_amount} for: {instance.violation_type.name}. '
            f'Location: {instance.location_description or "N/A"}. '
            f'Please pay the fine to avoid penalties.'
        )
        notif_type = 'fine'

    Notification.objects.create(
        user=instance.driver,
        title=title,
        message=message,
        notification_type=notif_type,
        related_object_id=instance.id,
    )
