from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model supporting citizen, officer, and admin roles.
    Uses email as the display identifier but keeps username for Django compat.
    """

    class Role(models.TextChoices):
        CITIZEN = 'citizen', 'Citizen'
        OFFICER = 'officer', 'Traffic Officer'
        ADMIN = 'admin', 'Administrator'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.CITIZEN,
    )
    phone = models.CharField(max_length=20, blank=True)
    citizenship_number = models.CharField(max_length=50, blank=True, unique=True, null=True)
    license_number = models.CharField(max_length=50, blank=True, unique=True, null=True)
    address = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def is_citizen(self):
        return self.role == self.Role.CITIZEN

    @property
    def is_officer(self):
        return self.role == self.Role.OFFICER

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN


class OfficerProfile(models.Model):
    """Extended profile for traffic officers."""

    class Rank(models.TextChoices):
        CONSTABLE = 'constable', 'Constable'
        HEAD_CONSTABLE = 'head_constable', 'Head Constable'
        ASI = 'asi', 'Assistant Sub-Inspector'
        SI = 'si', 'Sub-Inspector'
        INSPECTOR = 'inspector', 'Inspector'
        DSP = 'dsp', 'Deputy Superintendent'
        SP = 'sp', 'Superintendent'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='officer_profile',
    )
    badge_number = models.CharField(max_length=20, unique=True)
    station = models.CharField(max_length=100)
    rank = models.CharField(max_length=20, choices=Rank.choices, default=Rank.CONSTABLE)
    deployment_area = models.CharField(max_length=200, blank=True)
    is_on_duty = models.BooleanField(default=False)
    joined_force_date = models.DateField(blank=True, null=True)

    class Meta:
        verbose_name = 'Officer Profile'
        verbose_name_plural = 'Officer Profiles'

    def __str__(self):
        return f"Officer {self.badge_number} — {self.user.get_full_name()}"
