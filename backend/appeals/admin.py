from django.contrib import admin
from .models import Appeal


@admin.register(Appeal)
class AppealAdmin(admin.ModelAdmin):
    list_display = ['id', 'citizen', 'violation', 'status', 'reviewed_by', 'created_at', 'reviewed_at']
    list_filter = ['status', 'created_at']
    search_fields = ['citizen__first_name', 'citizen__last_name', 'reason']
    raw_id_fields = ['violation', 'citizen', 'reviewed_by']
