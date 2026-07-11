from rest_framework import generics, permissions

from accounts.permissions import IsAdmin, IsOfficerOrAdmin
from .models import MapLocation
from .serializers import MapLocationSerializer


class PublicMapView(generics.ListAPIView):
    """Public: list all active map locations (for the traffic map)."""

    serializer_class = MapLocationSerializer
    permission_classes = [permissions.AllowAny]
    queryset = MapLocation.objects.filter(is_active=True)
    filterset_fields = ['location_type', 'source']
    pagination_class = None  # Return all locations for the map


class OfficerCreateLocationView(generics.CreateAPIView):
    """Officer: publish an official map location directly."""

    serializer_class = MapLocationSerializer
    permission_classes = [IsOfficerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user, source='official')


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Officer/Admin: update or remove a map location."""

    serializer_class = MapLocationSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = MapLocation.objects.all()


class AdminLocationListView(generics.ListAPIView):
    """Admin: list all locations including inactive ones."""

    serializer_class = MapLocationSerializer
    permission_classes = [IsAdmin]
    queryset = MapLocation.objects.all()
    filterset_fields = ['location_type', 'source', 'is_active']
    search_fields = ['name', 'description']
