from django.contrib import admin
from .models import Evidence


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ['id', 'violation', 'evidence_type', 'source', 'uploaded_by', 'uploaded_at']
    list_filter = ['evidence_type', 'source', 'uploaded_at']
    raw_id_fields = ['violation', 'uploaded_by']
