from django.urls import path
from . import views

urlpatterns = [
    # Violation types
    path('types/', views.ViolationTypeListView.as_view(), name='violation_type_list'),
    path('types/<int:pk>/', views.ViolationTypeDetailView.as_view(), name='violation_type_detail'),

    # Traffic rules
    path('rules/', views.TrafficRuleListView.as_view(), name='traffic_rule_list'),
    path('rules/<int:pk>/', views.TrafficRuleDetailView.as_view(), name='traffic_rule_detail'),

    # Record violation (officer)
    path('preview/', views.RuleEnginePreviewView.as_view(), name='rule_engine_preview'),
    path('record/', views.RecordViolationView.as_view(), name='record_violation'),

    # Violation history
    path('my/', views.MyViolationsView.as_view(), name='my_violations'),
    path('all/', views.AllViolationsView.as_view(), name='all_violations'),
    path('<int:pk>/', views.ViolationDetailView.as_view(), name='violation_detail'),
    path('driver/<int:driver_id>/', views.DriverViolationsView.as_view(), name='driver_violations'),

    # Warnings
    path('warnings/my/', views.MyWarningsView.as_view(), name='my_warnings'),
    path('warnings/<int:pk>/acknowledge/', views.AcknowledgeWarningView.as_view(), name='acknowledge_warning'),

    # Pay fine
    path('<int:pk>/pay/', views.PayFineView.as_view(), name='pay_fine'),

    # Safety score
    path('safety-score/my/', views.MySafetyScoreView.as_view(), name='my_safety_score'),
    path('safety-score/my/history/', views.MySafetyScoreHistoryView.as_view(), name='my_safety_score_history'),
    path('safety-score/driver/<int:driver_id>/', views.DriverSafetyScoreView.as_view(), name='driver_safety_score'),

    # Community Service
    path('community-service/my/', views.MyCommunityServiceView.as_view(), name='my_community_service'),
    path('community-service/all/', views.AllCommunityServiceView.as_view(), name='all_community_service'),
    path('community-service/create/', views.CreateCommunityServiceView.as_view(), name='create_community_service'),
    path('community-service/<int:pk>/', views.UpdateCommunityServiceView.as_view(), name='update_community_service'),
]
