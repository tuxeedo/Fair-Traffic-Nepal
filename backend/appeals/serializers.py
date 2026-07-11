from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Appeal, Complaint

User = get_user_model()


class AppealSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(
        source='reviewed_by.get_full_name', read_only=True, default=None
    )
    violation_type = serializers.CharField(
        source='violation.violation_type.name', read_only=True
    )
    fine_amount = serializers.DecimalField(
        source='violation.fine_amount', max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Appeal
        fields = [
            'id', 'violation', 'citizen', 'citizen_name', 'reason',
            'status', 'admin_remarks', 'reviewed_by', 'reviewed_by_name',
            'violation_type', 'fine_amount',
            'created_at', 'updated_at', 'reviewed_at',
        ]
        read_only_fields = [
            'id', 'citizen', 'status', 'admin_remarks',
            'reviewed_by', 'created_at', 'updated_at', 'reviewed_at',
        ]


class SubmitAppealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appeal
        fields = ['violation', 'reason']

    def validate_violation(self, value):
        request = self.context['request']
        if value.driver != request.user:
            raise serializers.ValidationError('You can only appeal your own violations.')
        if hasattr(value, 'appeal'):
            raise serializers.ValidationError('An appeal already exists for this violation.')
        if value.action_taken != 'fine':
            raise serializers.ValidationError('You can only appeal fines, not warnings.')
        return value


class ReviewAppealSerializer(serializers.Serializer):
    """Admin reviews an appeal — accept or reject with remarks."""

    action = serializers.ChoiceField(choices=['accepted', 'rejected'])
    admin_remarks = serializers.CharField(required=True)


class ComplaintSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(source='citizen.get_full_name', read_only=True)
    officer_name = serializers.CharField(source='officer.get_full_name', read_only=True)
    officer_badge = serializers.CharField(source='officer.officer_profile.badge_number', read_only=True, default='')
    violation_details = serializers.CharField(source='violation.violation_type.name', read_only=True, default='')

    class Meta:
        model = Complaint
        fields = [
            'id', 'citizen', 'citizen_name', 'officer', 'officer_name', 'officer_badge',
            'violation', 'violation_details', 'subject', 'description', 'status',
            'admin_remarks', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'citizen', 'status', 'admin_remarks', 'created_at', 'updated_at']


class SubmitComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['officer', 'violation', 'subject', 'description']

    def validate(self, attrs):
        officer = attrs.get('officer')
        if officer.role != 'officer':
            raise serializers.ValidationError({'officer': 'Selected user is not an officer.'})
        return attrs


class ReviewComplaintSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['under_investigation', 'resolved', 'dismissed'])
    admin_remarks = serializers.CharField(required=True)
