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
    make = models.CharField(max_length=50, help_text='Manufacturer (e.g. Honda, Tata)')
    model = models.CharField(max_length=50, help_text='Model name (e.g. Dio, Nexon)')
    year = models.PositiveIntegerField(blank=True, null=True)
    color = models.CharField(max_length=30, blank=True)
    engine_number = models.CharField(max_length=50, blank=True)
    chassis_number = models.CharField(max_length=50, blank=True)
    bluebook_number = models.CharField(max_length=50, blank=True)
    insurance_expiry = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.registration_number} ({self.make} {self.model})"
