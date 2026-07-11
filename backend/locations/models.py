from django.db import models
from django.conf import settings


class MapLocation(models.Model):
    """
    Points of interest on the traffic map.
    Officers can publish directly; community reports create these on approval.
    """

    class LocationType(models.TextChoices):
        PARKING = 'parking', 'Parking Area'
        NO_PARKING = 'no_parking', 'No Parking Zone'
        CONSTRUCTION = 'construction', 'Road Construction'
        DIVERSION = 'diversion', 'Traffic Diversion'
        ACCIDENT = 'accident', 'Accident'
        TRAFFIC_LIGHT = 'traffic_light', 'Traffic Light'
        CHECKPOINT = 'checkpoint', 'Checkpoint'
        HOSPITAL = 'hospital', 'Hospital'
        FUEL_STATION = 'fuel_station', 'Fuel Station'
        ROAD_CLOSURE = 'road_closure', 'Road Closure'
        SPEED_ZONE = 'speed_zone', 'Speed Zone'

    class Source(models.TextChoices):
        OFFICIAL = 'official', 'Official (Officer)'
        COMMUNITY = 'community', 'Community Report'

    name = models.CharField(max_length=200)
    location_type = models.CharField(max_length=15, choices=LocationType.choices)
    gps_lat = models.DecimalField(max_digits=10, decimal_places=7)
    gps_lng = models.DecimalField(max_digits=10, decimal_places=7)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='added_locations',
    )
    source = models.CharField(
        max_length=10,
        choices=Source.choices,
        default=Source.OFFICIAL,
    )
    community_report = models.ForeignKey(
        'reports.CommunityReport',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='map_location',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_location_type_display()}: {self.name}"
