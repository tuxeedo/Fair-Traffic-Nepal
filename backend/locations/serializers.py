# pyrefly: ignore [missing-import]
from rest_framework import serializers
from .models import MapLocation


class MapLocationSerializer(serializers.ModelSerializer):
    added_by_name = serializers.CharField(source='added_by.get_full_name', read_only=True)

    class Meta:
        model = MapLocation
        fields = [
            'id', 'name', 'location_type', 'gps_lat', 'gps_lng',
            'description', 'is_active', 'added_by', 'added_by_name',
            'source', 'community_report', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'added_by', 'source', 'created_at', 'updated_at']
