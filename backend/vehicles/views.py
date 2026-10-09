from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from accounts.permissions import IsOfficerOrAdmin, IsCitizen, IsAdmin
from django.contrib.auth import get_user_model

from .models import Vehicle
from .serializers import (
    VehicleSerializer, 
    VehicleListSerializer,
)

User = get_user_model()

class MyVehicleListCreateView(generics.ListCreateAPIView):
    """Citizen: list own vehicles or register a new one."""
    serializer_class = VehicleSerializer
    permission_classes = [IsCitizen]

    def get_queryset(self):
        return Vehicle.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        vehicle = serializer.save(owner=self.request.user)
        from notifications.models import Notification

        # Notify owner
        Notification.objects.create(
            user=self.request.user,
            title="Vehicle Registered",
            message=f"Your vehicle {vehicle.registration_number} has been registered and is pending admin verification.",
            notification_type='system',
            related_object_id=vehicle.id,
        )

        # Notify admins
        for admin_user in User.objects.filter(role='admin', is_active=True):
            Notification.objects.create(
                user=admin_user,
                title="New Vehicle Pending Verification",
                message=f"Citizen {self.request.user.get_full_name()} registered vehicle {vehicle.registration_number} awaiting verification.",
                notification_type='system',
                related_object_id=vehicle.id,
            )

class MyVehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Citizen: view, update, or remove own vehicle."""
    serializer_class = VehicleSerializer
    permission_classes = [IsCitizen]

    def get_queryset(self):
        return Vehicle.objects.filter(owner=self.request.user)
        
    def perform_update(self, serializer):
        from rest_framework.exceptions import ValidationError
        # Only allow updates if not verified, or reset verification status
        if self.get_object().verification_status == Vehicle.VerificationStatus.VERIFIED:
            raise ValidationError("Cannot edit a verified vehicle. Request a change instead.")
        serializer.save(verification_status=Vehicle.VerificationStatus.PENDING)

class VehicleSearchView(generics.ListAPIView):
    """Officer/Admin: search vehicles by registration number."""
    serializer_class = VehicleListSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = Vehicle.objects.select_related('owner').all()
    search_fields = ['registration_number', 'owner__first_name', 'owner__last_name', 'bluebook_number']
    filterset_fields = ['vehicle_type', 'is_active', 'verification_status']

class VehiclesByOwnerView(generics.ListAPIView):
    """Officer/Admin: list all vehicles for a specific owner."""
    serializer_class = VehicleListSerializer
    permission_classes = [IsOfficerOrAdmin]

    def get_queryset(self):
        owner_id = self.kwargs['owner_id']
        return Vehicle.objects.filter(owner_id=owner_id)

class AdminPendingVerificationsView(generics.ListAPIView):
    """Admin: list pending verifications."""
    serializer_class = VehicleSerializer
    permission_classes = [IsAdmin]
    queryset = Vehicle.objects.filter(verification_status=Vehicle.VerificationStatus.PENDING)

class AdminApproveVerificationView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)
        vehicle.verification_status = Vehicle.VerificationStatus.VERIFIED
        vehicle.save()

        from notifications.models import Notification
        Notification.objects.create(
            user=vehicle.owner,
            title="Vehicle Verified",
            message=f"Your vehicle {vehicle.registration_number} has been officially verified by traffic admins.",
            notification_type='system',
            related_object_id=vehicle.id,
        )
        return Response({"status": "Verified"})

class AdminRejectVerificationView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)
        vehicle.verification_status = Vehicle.VerificationStatus.REJECTED
        vehicle.save()

        from notifications.models import Notification
        Notification.objects.create(
            user=vehicle.owner,
            title="Vehicle Verification Rejected",
            message=f"Verification for vehicle {vehicle.registration_number} was rejected.",
            notification_type='system',
            related_object_id=vehicle.id,
        )
        return Response({"status": "Rejected"})

class AdminRequestInfoVerificationView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)
        vehicle.verification_status = Vehicle.VerificationStatus.INFO_REQUESTED
        vehicle.save()

        from notifications.models import Notification
        Notification.objects.create(
            user=vehicle.owner,
            title="Vehicle Info Requested",
            message=f"Admin requested additional information for vehicle {vehicle.registration_number}.",
            notification_type='system',
            related_object_id=vehicle.id,
        )
        return Response({"status": "Info Requested"})
