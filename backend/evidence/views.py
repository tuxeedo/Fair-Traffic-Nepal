from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from accounts.permissions import IsOfficerOrAdmin
from .models import Evidence
from .serializers import EvidenceSerializer, EvidenceUploadSerializer


class ViolationEvidenceListView(generics.ListAPIView):
    """List all evidence for a specific violation."""

    serializer_class = EvidenceSerializer

    def get_queryset(self):
        violation_id = self.kwargs['violation_id']
        return Evidence.objects.filter(violation_id=violation_id)


class OfficerUploadEvidenceView(generics.CreateAPIView):
    """Officer: upload evidence for a violation."""

    serializer_class = EvidenceUploadSerializer
    permission_classes = [IsOfficerOrAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(
            uploaded_by=self.request.user,
            source='officer',
        )


class CitizenUploadEvidenceView(generics.CreateAPIView):
    """Citizen: upload supporting evidence for an appeal."""

    serializer_class = EvidenceUploadSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(
            uploaded_by=self.request.user,
            source='citizen',
        )


class EvidenceDeleteView(generics.DestroyAPIView):
    """Delete evidence — only by uploader or admin."""

    serializer_class = EvidenceSerializer
    queryset = Evidence.objects.all()

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_destroy(self, instance):
        if (
            instance.uploaded_by != self.request.user
            and self.request.user.role != 'admin'
        ):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only delete your own evidence.')
        instance.file.delete()  # Delete actual file
        instance.delete()
