from rest_framework import generics
from accounts.permissions import IsAdmin
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    """Admin: view all audit logs with filtering."""

    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    queryset = AuditLog.objects.select_related('user').all()
    filterset_fields = ['action', 'model_name', 'user']
    search_fields = ['action', 'model_name', 'details']
    ordering_fields = ['created_at']
