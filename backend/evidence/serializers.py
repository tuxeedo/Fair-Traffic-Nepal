from rest_framework import serializers
from .models import Evidence


class EvidenceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(
        source='uploaded_by.get_full_name', read_only=True
    )

    class Meta:
        model = Evidence
        fields = [
            'id', 'violation', 'uploaded_by', 'uploaded_by_name',
            'file', 'evidence_type', 'source', 'description', 'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_by', 'source', 'uploaded_at']


class EvidenceUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading evidence."""

    class Meta:
        model = Evidence
        fields = ['violation', 'file', 'evidence_type', 'description']
