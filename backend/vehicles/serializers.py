from rest_framework import serializers
from .models import Vehicle, VehicleDocuments, OwnershipHistory
from django.contrib.auth import get_user_model

User = get_user_model()

class VehicleDocumentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleDocuments
        fields = ['id', 'bluebook_front_image', 'bluebook_back_image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class VehicleSerializer(serializers.ModelSerializer):
    """Full vehicle serializer for CRUD operations."""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    documents = VehicleDocumentsSerializer(read_only=True)
    
    bluebook_front_image = serializers.ImageField(write_only=True, required=False)
    bluebook_back_image = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'owner', 'owner_name', 'registration_number',
            'vehicle_type', 'brand', 'model', 'registration_date', 'color',
            'engine_number', 'chassis_number', 'bluebook_number',
            'insurance_expiry', 'is_active', 'verification_status', 'created_at', 'updated_at',
            'documents', 'bluebook_front_image', 'bluebook_back_image'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at', 'verification_status']

    def create(self, validated_data):
        front_img = validated_data.pop('bluebook_front_image', None)
        back_img = validated_data.pop('bluebook_back_image', None)
        validated_data['owner'] = self.context['request'].user
        validated_data['verification_status'] = Vehicle.VerificationStatus.PENDING
        vehicle = super().create(validated_data)
        if front_img and back_img:
            VehicleDocuments.objects.create(vehicle=vehicle, bluebook_front_image=front_img, bluebook_back_image=back_img)
        return vehicle


class VehicleListSerializer(serializers.ModelSerializer):
    """Lightweight vehicle serializer for listings and search results."""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'owner', 'owner_name', 'registration_number',
            'vehicle_type', 'brand', 'model', 'registration_date', 'color', 'is_active', 'verification_status'
        ]

class OwnershipHistorySerializer(serializers.ModelSerializer):
    previous_owner_name = serializers.CharField(source='previous_owner.get_full_name', read_only=True)
    new_owner_name = serializers.CharField(source='new_owner.get_full_name', read_only=True)
    vehicle_number = serializers.CharField(source='vehicle.registration_number', read_only=True)

    class Meta:
        model = OwnershipHistory
        fields = ['id', 'vehicle', 'vehicle_number', 'previous_owner', 'previous_owner_name', 'new_owner', 'new_owner_name', 'transfer_date', 'status']
        read_only_fields = ['id', 'transfer_date', 'status']

class InitiateTransferSerializer(serializers.Serializer):
    new_owner_email = serializers.EmailField()
    vehicle_id = serializers.IntegerField()
