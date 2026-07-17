from django.db import models
from django.conf import settings


class Vehicle(models.Model):
    """Registered vehicle linked to a citizen owner."""

    class VehicleType(models.TextChoices):
        MOTORCYCLE = 'motorcycle', 'Motorcycle'
        SCOOTER = 'scooter', 'Scooter'
        CAR = 'car', 'Car'
        JEEP = 'jeep', 'Jeep/SUV'
        VAN = 'van', 'Van'
        BUS = 'bus', 'Bus'
        TRUCK = 'truck', 'Truck'
        TEMPO = 'tempo', 'Tempo'
        AUTO_RICKSHAW = 'auto_rickshaw', 'Auto Rickshaw'
        OTHER = 'other', 'Other'

    class VerificationStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending Verification'
        VERIFIED = 'Verified', 'Verified'
        REJECTED = 'Rejected', 'Rejected'
        INFO_REQUESTED = 'Info_Requested', 'Information Requested'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vehicles',
    )
    registration_number = models.CharField(max_length=30, unique=True)
    vehicle_type = models.CharField(
        max_length=20,
        choices=VehicleType.choices,
        default=VehicleType.MOTORCYCLE,
    )
    brand = models.CharField(max_length=50, help_text='Manufacturer (e.g. Honda, Tata)')
    model = models.CharField(max_length=50, help_text='Model name (e.g. Dio, Nexon)')
    registration_date = models.DateField(blank=True, null=True)
    color = models.CharField(max_length=30, blank=True)
    engine_number = models.CharField(max_length=50, blank=True)
    chassis_number = models.CharField(max_length=50, blank=True)
    bluebook_number = models.CharField(max_length=50, unique=True)
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    insurance_expiry = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.registration_number} ({self.brand} {self.model})"


class VehicleDocuments(models.Model):
    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='documents')
    bluebook_front_image = models.ImageField(upload_to='vehicle_docs/')
    bluebook_back_image = models.ImageField(upload_to='vehicle_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Vehicle Documents'


class OwnershipHistory(models.Model):
    class TransferStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        APPROVED = 'Approved', 'Approved'
        REJECTED = 'Rejected', 'Rejected'
        
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='ownership_history')
    previous_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='previous_ownerships'
    )
    new_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='new_ownerships'
    )
    transfer_date = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=TransferStatus.choices,
        default=TransferStatus.PENDING
    )
