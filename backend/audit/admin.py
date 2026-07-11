from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'user', 'action', 'model_name', 'object_id']
    list_filter = ['action', 'model_name', 'created_at']
    search_fields = ['action', 'user__first_name', 'user__last_name']
    date_hierarchy = 'created_at'
    readonly_fields = ['user', 'action', 'model_name', 'object_id', 'details', 'ip_address', 'created_at']
