from django.contrib.auth.models import AbstractUser
from django.db import models


class GovernmentCitizenRecord(models.Model):
    """
    Pre-populated simulation of National Government Identity Registry (Ministry of Home Affairs / NID).
    Used to verify citizen identity during account registration.
    """
    full_name = models.CharField(max_length=150)
    first_name = models.CharField(max_length=75)
    last_name = models.CharField(max_length=75)
    citizenship_number = models.CharField(max_length=50, unique=True, db_index=True)
    nid_number = models.CharField(max_length=50, unique=True, db_index=True)
    license_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    date_of_birth = models.DateField()

    father_name = models.CharField(max_length=150, blank=True, default='')
    address = models.TextField(blank=True, default='Kathmandu, Nepal')
    is_registered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return f"{self.full_name} (Citizenship: {self.citizenship_number} | NID: {self.nid_number})"


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
    nid_number = models.CharField(max_length=50, blank=True, unique=True, null=True)
    license_number = models.CharField(max_length=50, blank=True, unique=True, null=True)
    address = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    citizen_record = models.ForeignKey(
        GovernmentCitizenRecord,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registered_users'
    )



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


class CorrectionRequest(models.Model):
    """
    Profile information correction request submitted by a user.
    Requires Admin review and verification before updating the user profile.
    """

    class FieldName(models.TextChoices):
        FIRST_NAME = 'first_name', 'First Name'
        LAST_NAME = 'last_name', 'Last Name'
        EMAIL = 'email', 'Email Address'
        PHONE = 'phone', 'Phone Number'
        CITIZENSHIP_NUMBER = 'citizenship_number', 'Citizenship Number'
        NID_NUMBER = 'nid_number', 'National ID (NID)'
        LICENSE_NUMBER = 'license_number', 'License Number'

        ADDRESS = 'address', 'Address'
        DATE_OF_BIRTH = 'date_of_birth', 'Date of Birth'

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending Review'
        APPROVED = 'Approved', 'Approved'
        REJECTED = 'Rejected', 'Rejected'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='correction_requests',
    )
    field_name = models.CharField(max_length=50, choices=FieldName.choices)
    current_value = models.CharField(max_length=255, blank=True)
    requested_value = models.CharField(max_length=255)
    reason = models.TextField()
    supporting_document = models.FileField(
        upload_to='correction_documents/%Y/%m/%d/',
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_corrections',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Correction Request'
        verbose_name_plural = 'Correction Requests'

    def __str__(self):
        return f"Correction #{self.pk}: {self.user} - {self.get_field_name_display()} ({self.status})"

