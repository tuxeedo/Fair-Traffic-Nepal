from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.SubmitAppealView.as_view(), name='submit_appeal'),
    path('my/', views.MyAppealsView.as_view(), name='my_appeals'),
    path('all/', views.AllAppealsView.as_view(), name='all_appeals'),
    path('<int:pk>/', views.AppealDetailView.as_view(), name='appeal_detail'),
    path('<int:pk>/review/', views.ReviewAppealView.as_view(), name='review_appeal'),

    # Complaints paths
    path('complaints/submit/', views.SubmitComplaintView.as_view(), name='submit_complaint'),
    path('complaints/my/', views.MyComplaintsView.as_view(), name='my_complaints'),
    path('complaints/all/', views.AllComplaintsView.as_view(), name='all_complaints'),
    path('complaints/<int:pk>/', views.ComplaintDetailView.as_view(), name='complaint_detail'),
    path('complaints/<int:pk>/review/', views.ReviewComplaintView.as_view(), name='review_complaint'),
]
