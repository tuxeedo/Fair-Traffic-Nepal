from django.contrib import admin
from .models import Vehicle, VehicleDocuments, OwnershipHistory

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'owner', 'vehicle_type', 'brand', 'model', 'registration_date', 'verification_status', 'is_active']
    list_filter = ['vehicle_type', 'verification_status', 'is_active']
    search_fields = ['registration_number', 'owner__first_name', 'owner__last_name', 'bluebook_number']
    raw_id_fields = ['owner']

@admin.register(VehicleDocuments)
class VehicleDocumentsAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'uploaded_at']
    raw_id_fields = ['vehicle']

@admin.register(OwnershipHistory)
class OwnershipHistoryAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'previous_owner', 'new_owner', 'transfer_date', 'status']
    list_filter = ['status']
    raw_id_fields = ['vehicle', 'previous_owner', 'new_owner']
