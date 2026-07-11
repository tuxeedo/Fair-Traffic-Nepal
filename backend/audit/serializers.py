from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='System')
    user_role = serializers.CharField(source='user.role', read_only=True, default='')

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_name', 'user_role', 'action',
            'model_name', 'object_id', 'details', 'ip_address', 'created_at',
        ]
