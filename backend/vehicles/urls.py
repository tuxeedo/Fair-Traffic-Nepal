from django.urls import path
from . import views

urlpatterns = [
    # Citizen — own vehicles
    path('my/', views.MyVehicleListCreateView.as_view(), name='my_vehicles'),
    path('my/<int:pk>/', views.MyVehicleDetailView.as_view(), name='my_vehicle_detail'),

    # Officer/Admin — search
    path('search/', views.VehicleSearchView.as_view(), name='vehicle_search'),
    path('owner/<int:owner_id>/', views.VehiclesByOwnerView.as_view(), name='vehicles_by_owner'),
]
