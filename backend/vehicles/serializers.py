from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    """Full vehicle serializer for CRUD operations."""

    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'owner', 'owner_name', 'registration_number',
            'vehicle_type', 'make', 'model', 'year', 'color',
            'engine_number', 'chassis_number', 'bluebook_number',
            'insurance_expiry', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class VehicleListSerializer(serializers.ModelSerializer):
    """Lightweight vehicle serializer for listings and search results."""

    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'owner', 'owner_name', 'registration_number',
            'vehicle_type', 'make', 'model', 'year', 'color', 'is_active',
        ]
