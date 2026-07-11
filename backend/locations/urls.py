from django.urls import path
from . import views

urlpatterns = [
    path('map/', views.PublicMapView.as_view(), name='public_map'),
    path('create/', views.OfficerCreateLocationView.as_view(), name='create_location'),
    path('all/', views.AdminLocationListView.as_view(), name='all_locations'),
    path('<int:pk>/', views.LocationDetailView.as_view(), name='location_detail'),
]
