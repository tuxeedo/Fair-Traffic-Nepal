from rest_framework import generics
from accounts.permissions import IsOfficerOrAdmin, IsCitizen

from .models import Vehicle
from .serializers import VehicleSerializer, VehicleListSerializer


class MyVehicleListCreateView(generics.ListCreateAPIView):
    """Citizen: list own vehicles or register a new one."""

    serializer_class = VehicleSerializer
    permission_classes = [IsCitizen]

    def get_queryset(self):
        return Vehicle.objects.filter(owner=self.request.user)


class MyVehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Citizen: view, update, or remove own vehicle."""

    serializer_class = VehicleSerializer
    permission_classes = [IsCitizen]

    def get_queryset(self):
        return Vehicle.objects.filter(owner=self.request.user)


class VehicleSearchView(generics.ListAPIView):
    """Officer/Admin: search vehicles by registration number."""

    serializer_class = VehicleListSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = Vehicle.objects.select_related('owner').all()
    search_fields = ['registration_number', 'owner__first_name', 'owner__last_name']
    filterset_fields = ['vehicle_type', 'is_active']


class VehiclesByOwnerView(generics.ListAPIView):
    """Officer/Admin: list all vehicles for a specific owner."""

    serializer_class = VehicleListSerializer
    permission_classes = [IsOfficerOrAdmin]

    def get_queryset(self):
        owner_id = self.kwargs['owner_id']
        return Vehicle.objects.filter(owner_id=owner_id)
