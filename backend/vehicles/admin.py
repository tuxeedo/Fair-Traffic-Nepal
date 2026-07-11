from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'owner', 'vehicle_type', 'make', 'model', 'year', 'is_active']
    list_filter = ['vehicle_type', 'is_active']
    search_fields = ['registration_number', 'owner__first_name', 'owner__last_name', 'bluebook_number']
    raw_id_fields = ['owner']
