from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    ViolationType, TrafficRule, Violation, Warning,
    SafetyScore, SafetyScoreHistory, CommunityService
)

User = get_user_model()


class ViolationTypeSerializer(serializers.ModelSerializer):
    rules_count = serializers.IntegerField(source='rules.count', read_only=True)

    class Meta:
        model = ViolationType
        fields = [
            'id', 'name', 'code', 'category', 'base_fine_amount',
            'description', 'is_active', 'rules_count', 'created_at',
        ]


class TrafficRuleSerializer(serializers.ModelSerializer):
    violation_type_name = serializers.CharField(
        source='violation_type.name', read_only=True
    )

    class Meta:
        model = TrafficRule
        fields = [
            'id', 'violation_type', 'violation_type_name',
            'offense_number', 'time_window_days', 'action',
            'fine_amount', 'is_immediate', 'description',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class WarningSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warning
        fields = ['id', 'violation', 'message', 'acknowledged', 'acknowledged_at']
        read_only_fields = ['id', 'violation']


class ViolationSerializer(serializers.ModelSerializer):
    """Full violation details."""

    driver_name = serializers.CharField(source='driver.get_full_name', read_only=True)
    officer_name = serializers.CharField(source='officer.get_full_name', read_only=True)
    violation_type_name = serializers.CharField(source='violation_type.name', read_only=True)
    violation_category = serializers.CharField(source='violation_type.category', read_only=True)
    vehicle_registration = serializers.CharField(
        source='vehicle.registration_number', read_only=True, default=None
    )
    warning = WarningSerializer(read_only=True)

    class Meta:
        model = Violation
        fields = [
            'id', 'driver', 'driver_name', 'vehicle', 'vehicle_registration',
            'officer', 'officer_name', 'violation_type', 'violation_type_name',
            'violation_category', 'action_taken', 'fine_amount', 'is_paid',
            'paid_at', 'gps_lat', 'gps_lng', 'location_description',
            'officer_remarks', 'rule_applied', 'warning', 'created_at',
        ]
        read_only_fields = [
            'id', 'officer', 'action_taken', 'fine_amount',
            'is_paid', 'paid_at', 'rule_applied', 'created_at',
        ]


class RecordViolationSerializer(serializers.Serializer):
    """
    Serializer for officers to record a new violation.
    The rule engine determines the action; the officer confirms.
    """

    driver_id = serializers.IntegerField()
    vehicle_id = serializers.IntegerField(required=False, allow_null=True)
    violation_type_id = serializers.IntegerField()
    gps_lat = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)
    gps_lng = serializers.DecimalField(max_digits=10, decimal_places=7, required=False)
    location_description = serializers.CharField(max_length=255, required=False, default='')
    officer_remarks = serializers.CharField(required=False, default='')
    override_action = serializers.ChoiceField(
        choices=['warning', 'fine'],
        required=False,
        help_text='Officer can override the rule engine recommendation.',
    )

    def validate_driver_id(self, value):
        if not User.objects.filter(id=value, role='citizen').exists():
            raise serializers.ValidationError('Driver not found.')
        return value

    def validate_violation_type_id(self, value):
        if not ViolationType.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('Invalid or inactive violation type.')
        return value


class SafetyScoreSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.get_full_name', read_only=True)

    class Meta:
        model = SafetyScore
        fields = ['id', 'driver', 'driver_name', 'current_score', 'last_updated']


class SafetyScoreHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SafetyScoreHistory
        fields = [
            'id', 'driver', 'score_change', 'reason',
            'previous_score', 'new_score', 'violation', 'created_at',
        ]


class PayFineSerializer(serializers.Serializer):
    """Simulated fine payment."""

    payment_method = serializers.ChoiceField(
        choices=['esewa', 'khalti', 'bank_transfer', 'cash'],
        default='esewa',
    )
    transaction_reference = serializers.CharField(max_length=100, required=False, default='')

class CommunityServiceSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.get_full_name', read_only=True)
    violation_details = serializers.CharField(source='violation.violation_type.name', read_only=True)
    violation_date = serializers.DateTimeField(source='violation.created_at', read_only=True)

    class Meta:
        model = CommunityService
        fields = [
            'id', 'violation', 'violation_details', 'violation_date',
            'driver', 'driver_name', 'assigned_hours', 'completed_hours',
            'service_type', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'violation', 'driver', 'created_at', 'updated_at']
