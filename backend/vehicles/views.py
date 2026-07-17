from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from accounts.permissions import IsOfficerOrAdmin, IsCitizen, IsAdmin
from django.contrib.auth import get_user_model

from .models import Vehicle, OwnershipHistory
from .serializers import (
    VehicleSerializer, 
    VehicleListSerializer,
    OwnershipHistorySerializer,
    InitiateTransferSerializer
)

User = get_user_model()

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
        return Response({"status": "Verified"})

class AdminRejectVerificationView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)
        vehicle.verification_status = Vehicle.VerificationStatus.REJECTED
        vehicle.save()
        return Response({"status": "Rejected"})

class AdminRequestInfoVerificationView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, pk):
        vehicle = get_object_or_404(Vehicle, pk=pk)
        vehicle.verification_status = Vehicle.VerificationStatus.INFO_REQUESTED
        vehicle.save()
        return Response({"status": "Info Requested"})
        
class InitiateTransferView(APIView):
    """Citizen: initiate transfer to new owner email"""
    permission_classes = [IsCitizen]
    def post(self, request):
        serializer = InitiateTransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vehicle = get_object_or_404(Vehicle, pk=serializer.validated_data['vehicle_id'], owner=request.user)
        new_owner = get_object_or_404(User, email=serializer.validated_data['new_owner_email'])
        
        transfer = OwnershipHistory.objects.create(
            vehicle=vehicle,
            previous_owner=request.user,
            new_owner=new_owner,
            status=OwnershipHistory.TransferStatus.PENDING
        )
        return Response(OwnershipHistorySerializer(transfer).data)

class AdminPendingTransfersView(generics.ListAPIView):
    """Admin: list pending transfers."""
    serializer_class = OwnershipHistorySerializer
    permission_classes = [IsAdmin]
    queryset = OwnershipHistory.objects.filter(status=OwnershipHistory.TransferStatus.PENDING)

class AdminApproveTransferView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, pk):
        transfer = get_object_or_404(OwnershipHistory, pk=pk)
        transfer.status = OwnershipHistory.TransferStatus.APPROVED
        transfer.save()
        
        vehicle = transfer.vehicle
        vehicle.owner = transfer.new_owner
        vehicle.save()
        return Response({"status": "Transfer Approved"})
