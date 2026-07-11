from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import OfficerProfile

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for citizen registration."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'citizenship_number', 'license_number',
            'address', 'date_of_birth', 'password', 'password_confirm',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError(
                {'password_confirm': 'Passwords do not match.'}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.role = User.Role.CITIZEN
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing/updating user profile."""

    officer_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'citizenship_number', 'license_number',
            'address', 'date_of_birth', 'avatar', 'role',
            'date_joined', 'officer_profile',
        ]
        read_only_fields = ['id', 'username', 'role', 'date_joined']

    def get_officer_profile(self, obj):
        if obj.role == 'officer' and hasattr(obj, 'officer_profile'):
            return OfficerProfileSerializer(obj.officer_profile).data
        return None


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for admin user listings."""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'role', 'is_active', 'date_joined',
        ]


class OfficerProfileSerializer(serializers.ModelSerializer):
    """Serializer for officer profile details."""

    user = UserListSerializer(read_only=True)

    class Meta:
        model = OfficerProfile
        fields = [
            'id', 'user', 'badge_number', 'station', 'rank',
            'deployment_area', 'is_on_duty', 'joined_force_date',
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value


class OfficerCreateSerializer(serializers.ModelSerializer):
    """Serializer for admin to create officer accounts."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    badge_number = serializers.CharField(write_only=True)
    station = serializers.CharField(write_only=True)
    rank = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'password', 'badge_number', 'station', 'rank',
        ]

    def create(self, validated_data):
        badge_number = validated_data.pop('badge_number')
        station = validated_data.pop('station')
        rank = validated_data.pop('rank', 'constable')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.role = User.Role.OFFICER
        user.set_password(password)
        user.save()

        OfficerProfile.objects.create(
            user=user,
            badge_number=badge_number,
            station=station,
            rank=rank,
        )
        return user
