from django.contrib import admin
from .models import MapLocation


@admin.register(MapLocation)
class MapLocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'location_type', 'source', 'is_active', 'added_by', 'created_at']
    list_filter = ['location_type', 'source', 'is_active']
    search_fields = ['name', 'description']
