from rest_framework import serializers
from .models import CommunityReport


class CommunityReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(
        source='reviewed_by.get_full_name', read_only=True, default=None
    )

    class Meta:
        model = CommunityReport
        fields = [
            'id', 'reporter', 'reporter_name', 'report_type', 'title',
            'description', 'gps_lat', 'gps_lng', 'address', 'photo',
            'status', 'reviewed_by', 'reviewed_by_name', 'review_remarks',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reporter', 'status', 'reviewed_by',
            'review_remarks', 'created_at', 'updated_at',
        ]


class ReviewReportSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approved', 'rejected'])
    review_remarks = serializers.CharField(required=False, default='')
