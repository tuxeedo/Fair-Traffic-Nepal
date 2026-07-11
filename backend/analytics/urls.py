from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('daily-violations/', views.DailyViolationsView.as_view(), name='daily_violations'),
    path('monthly-violations/', views.MonthlyViolationsView.as_view(), name='monthly_violations'),
    path('violations-by-type/', views.ViolationsByTypeView.as_view(), name='violations_by_type'),
    path('top-offenders/', views.TopOffendersView.as_view(), name='top_offenders'),
    path('heatmap/', views.ViolationHeatmapView.as_view(), name='violation_heatmap'),
    path('officer-performance/', views.OfficerPerformanceView.as_view(), name='officer_performance'),
    path('appeal-stats/', views.AppealStatsView.as_view(), name='appeal_stats'),
    path('report-stats/', views.ReportStatsView.as_view(), name='report_stats'),
]
