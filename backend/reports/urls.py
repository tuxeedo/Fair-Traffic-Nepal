from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.SubmitReportView.as_view(), name='submit_report'),
    path('my/', views.MyReportsView.as_view(), name='my_reports'),
    path('all/', views.AllReportsView.as_view(), name='all_reports'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report_detail'),
    path('<int:pk>/review/', views.ReviewReportView.as_view(), name='review_report'),
]
