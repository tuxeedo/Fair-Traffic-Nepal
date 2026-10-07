from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OfficerProfile, GovernmentCitizenRecord


@admin.register(GovernmentCitizenRecord)
class GovernmentCitizenRecordAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'citizenship_number', 'nid_number', 'license_number', 'date_of_birth', 'is_registered']
    list_filter = ['is_registered', 'date_of_birth']
    search_fields = ['full_name', 'citizenship_number', 'nid_number', 'license_number']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'license_number']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('FairTraffic', {
            'fields': ('role', 'phone', 'citizenship_number', 'nid_number', 'license_number', 'address', 'date_of_birth', 'avatar', 'citizen_record'),
        }),
    )


@admin.register(OfficerProfile)
class OfficerProfileAdmin(admin.ModelAdmin):
    list_display = ['badge_number', 'user', 'station', 'rank', 'is_on_duty']
    list_filter = ['rank', 'is_on_duty', 'station']
    search_fields = ['badge_number', 'user__first_name', 'user__last_name']

