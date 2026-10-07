from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import OfficerProfile, CorrectionRequest, GovernmentCitizenRecord

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for citizen registration with Citizenship or NID validation."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'citizenship_number', 'nid_number', 'license_number',
            'address', 'date_of_birth', 'password', 'password_confirm',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError(
                {'password_confirm': 'Passwords do not match.'}
            )

        citizenship = attrs.get('citizenship_number', '').strip()
        nid = attrs.get('nid_number', '').strip()

        if not citizenship and not nid:
            raise serializers.ValidationError(
                {'citizenship_number': 'Please provide either a Citizenship Number or National ID (NID).'}
            )

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        citizenship = validated_data.get('citizenship_number', '').strip()
        nid = validated_data.get('nid_number', '').strip()

        # Find matching government record if available
        record = None
        if citizenship:
            record = GovernmentCitizenRecord.objects.filter(citizenship_number__icontains=citizenship).first()
        if not record and nid:
            record = GovernmentCitizenRecord.objects.filter(nid_number__icontains=nid).first()

        user = User(**validated_data)
        user.role = User.Role.CITIZEN

        if record:
            user.citizen_record = record
            if not user.first_name:
                user.first_name = record.first_name
            if not user.last_name:
                user.last_name = record.last_name
            if not user.date_of_birth:
                user.date_of_birth = record.date_of_birth
            if not user.citizenship_number:
                user.citizenship_number = record.citizenship_number
            if not user.nid_number:
                user.nid_number = record.nid_number
            if not user.license_number and record.license_number:
                user.license_number = record.license_number
            if not user.address and record.address:
                user.address = record.address

            record.is_registered = True
            record.save()

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
            'phone', 'citizenship_number', 'nid_number', 'license_number',
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


class CorrectionRequestSerializer(serializers.ModelSerializer):
    """Serializer for submitting and reading profile correction requests."""

    user_details = UserListSerializer(source='user', read_only=True)
    reviewed_by_name = serializers.SerializerMethodField()
    field_name_display = serializers.CharField(source='get_field_name_display', read_only=True)

    class Meta:
        model = CorrectionRequest
        fields = [
            'id', 'user', 'user_details', 'field_name', 'field_name_display',
            'current_value', 'requested_value', 'reason', 'supporting_document',
            'status', 'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'rejection_reason', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'user', 'user_details', 'current_value', 'status',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at',
            'rejection_reason', 'created_at', 'updated_at',
        ]

    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.get_full_name() or obj.reviewed_by.username
        return None

    def validate_supporting_document(self, value):
        if value:
            # File size limit: 10 MB
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("File size must not exceed 10 MB.")
            # Allowed extensions check
            ext = value.name.split('.')[-1].lower()
            if ext not in ['pdf', 'jpg', 'jpeg', 'png', 'webp']:
                raise serializers.ValidationError("Only PDF, JPG, PNG, and WEBP files are allowed.")
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not request.user:
            return attrs

        user = request.user
        field_name = attrs.get('field_name')
        requested_value = attrs.get('requested_value')

        # Check if attribute exists on user
        if not hasattr(user, field_name):
            raise serializers.ValidationError({"field_name": "Invalid profile field specified."})

        current_val = str(getattr(user, field_name, '') or '')
        if current_val == requested_value:
            raise serializers.ValidationError(
                {"requested_value": "New requested value is identical to your current value."}
            )

        # Security check: Prevent duplicate pending requests for the same field
        pending_exists = CorrectionRequest.objects.filter(
            user=user,
            field_name=field_name,
            status=CorrectionRequest.Status.PENDING,
        ).exists()
        if pending_exists:
            raise serializers.ValidationError(
                {"field_name": f"You already have a pending correction request for {field_name}. Please wait for Admin review."}
            )

        attrs['current_value'] = current_val
        return attrs


class CorrectionRequestReviewSerializer(serializers.Serializer):
    """Serializer for Admin to approve or reject a correction request."""

    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['action'] == 'reject' and not attrs.get('rejection_reason', '').strip():
            raise serializers.ValidationError(
                {"rejection_reason": "A rejection reason must be provided when rejecting a request."}
            )
        return attrs

