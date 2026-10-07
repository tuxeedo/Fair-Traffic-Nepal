from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('verify-identity/', views.VerifyIdentityView.as_view(), name='verify_identity'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),


    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),

    # Profile Correction Requests
    path('corrections/', views.CorrectionRequestListCreateView.as_view(), name='correction_list_create'),
    path('corrections/<int:pk>/', views.CorrectionRequestDetailView.as_view(), name='correction_detail'),
    path('corrections/<int:pk>/review/', views.CorrectionRequestReviewView.as_view(), name='correction_review'),


    # Admin — user management
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),

    # Admin — officer management
    path('officers/', views.OfficerListView.as_view(), name='officer_list'),
    path('officers/<int:pk>/', views.OfficerDetailView.as_view(), name='officer_detail'),

    # Officer — driver search
    path('drivers/search/', views.DriverSearchView.as_view(), name='driver_search'),
]
