from django.contrib import admin
from .models import CommunityReport


@admin.register(CommunityReport)
class CommunityReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'report_type', 'reporter', 'status', 'created_at']
    list_filter = ['report_type', 'status', 'created_at']
    search_fields = ['title', 'description', 'reporter__first_name']
    raw_id_fields = ['reporter', 'reviewed_by']
