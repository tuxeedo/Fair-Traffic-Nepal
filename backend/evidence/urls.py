from django.urls import path
from . import views

urlpatterns = [
    path('violation/<int:violation_id>/', views.ViolationEvidenceListView.as_view(), name='violation_evidence'),
    path('upload/officer/', views.OfficerUploadEvidenceView.as_view(), name='officer_upload_evidence'),
    path('upload/citizen/', views.CitizenUploadEvidenceView.as_view(), name='citizen_upload_evidence'),
    path('<int:pk>/delete/', views.EvidenceDeleteView.as_view(), name='delete_evidence'),
]
