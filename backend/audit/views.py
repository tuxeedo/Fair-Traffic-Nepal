from rest_framework import generics
from accounts.permissions import IsAdmin
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    """Admin: view all audit logs with rich search and filtering."""

    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    queryset = AuditLog.objects.select_related('user').all()
    filterset_fields = ['action', 'model_name', 'user', 'user__role']
    search_fields = [
        'action', 'model_name', 'object_id', 'ip_address',
        'user__username', 'user__first_name', 'user__last_name', 'user__email'
    ]
    ordering_fields = ['created_at', 'action', 'model_name']

