from django.urls import path
from . import views

urlpatterns = [
    # Citizen — own vehicles
    path('my/', views.MyVehicleListCreateView.as_view(), name='my_vehicles'),
    path('my/<int:pk>/', views.MyVehicleDetailView.as_view(), name='my_vehicle_detail'),

    # Officer/Admin — search
    path('search/', views.VehicleSearchView.as_view(), name='vehicle_search'),
    path('owner/<int:owner_id>/', views.VehiclesByOwnerView.as_view(), name='vehicles_by_owner'),
    
    # Admin - Verification
    path('admin/verifications/', views.AdminPendingVerificationsView.as_view(), name='admin_pending_verifications'),
    path('admin/verifications/<int:pk>/approve/', views.AdminApproveVerificationView.as_view(), name='admin_approve_verification'),
    path('admin/verifications/<int:pk>/reject/', views.AdminRejectVerificationView.as_view(), name='admin_reject_verification'),
    path('admin/verifications/<int:pk>/request-info/', views.AdminRequestInfoVerificationView.as_view(), name='admin_request_info_verification'),
]
