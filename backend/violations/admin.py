from django.contrib import admin
from .models import ViolationType, TrafficRule, Violation, Warning, SafetyScore, SafetyScoreHistory


@admin.register(ViolationType)
class ViolationTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'category', 'base_fine_amount', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'code']


@admin.register(TrafficRule)
class TrafficRuleAdmin(admin.ModelAdmin):
    list_display = ['violation_type', 'offense_number', 'action', 'fine_amount', 'is_immediate', 'time_window_days']
    list_filter = ['action', 'is_immediate', 'violation_type']
    ordering = ['violation_type', 'offense_number']


@admin.register(Violation)
class ViolationAdmin(admin.ModelAdmin):
    list_display = ['id', 'driver', 'violation_type', 'action_taken', 'fine_amount', 'is_paid', 'officer', 'created_at']
    list_filter = ['action_taken', 'is_paid', 'violation_type__category', 'created_at']
    search_fields = ['driver__first_name', 'driver__last_name', 'officer__first_name']
    raw_id_fields = ['driver', 'officer', 'vehicle']
    date_hierarchy = 'created_at'


@admin.register(Warning)
class WarningAdmin(admin.ModelAdmin):
    list_display = ['violation', 'acknowledged', 'acknowledged_at']
    list_filter = ['acknowledged']


@admin.register(SafetyScore)
class SafetyScoreAdmin(admin.ModelAdmin):
    list_display = ['driver', 'current_score', 'last_updated']
    search_fields = ['driver__first_name', 'driver__last_name']


@admin.register(SafetyScoreHistory)
class SafetyScoreHistoryAdmin(admin.ModelAdmin):
    list_display = ['driver', 'score_change', 'reason', 'previous_score', 'new_score', 'created_at']
    list_filter = ['created_at']
    date_hierarchy = 'created_at'
