from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from accounts.permissions import IsAdmin, IsOfficerOrAdmin, IsCitizen
from .models import CommunityReport
from .serializers import CommunityReportSerializer, ReviewReportSerializer


class SubmitReportView(generics.CreateAPIView):
    """Citizen: submit a community report."""

    serializer_class = CommunityReportSerializer
    permission_classes = [IsCitizen]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class MyReportsView(generics.ListAPIView):
    """Citizen: view own submitted reports."""

    serializer_class = CommunityReportSerializer
    permission_classes = [IsCitizen]
    filterset_fields = ['status', 'report_type']

    def get_queryset(self):
        return CommunityReport.objects.filter(reporter=self.request.user)


class AllReportsView(generics.ListAPIView):
    """Officer/Admin: list all reports with filtering."""

    serializer_class = CommunityReportSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = CommunityReport.objects.select_related('reporter', 'reviewed_by').all()
    filterset_fields = ['status', 'report_type']
    search_fields = ['title', 'description', 'address']
    ordering_fields = ['created_at', 'status']


class ReportDetailView(generics.RetrieveAPIView):
    """View report details."""

    serializer_class = CommunityReportSerializer
    queryset = CommunityReport.objects.select_related('reporter', 'reviewed_by')


class ReviewReportView(APIView):
    """Officer/Admin: approve or reject a community report."""

    permission_classes = [IsOfficerOrAdmin]

    def post(self, request, pk):
        try:
            report = CommunityReport.objects.get(pk=pk)
        except CommunityReport.DoesNotExist:
            return Response({'error': 'Report not found.'}, status=404)

        if report.status != 'pending':
            return Response(
                {'error': 'This report has already been reviewed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReviewReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        report.status = action
        report.reviewed_by = request.user
        report.review_remarks = serializer.validated_data.get('review_remarks', '')
        report.save()

        # If approved and has GPS, create a map location
        if action == 'approved' and report.gps_lat and report.gps_lng:
            from locations.models import MapLocation
            # Map report types to location types
            type_mapping = {
                'parking_suggestion': 'parking',
                'broken_traffic_light': 'traffic_light',
                'construction': 'construction',
                'accident': 'accident',
                'road_hazard': 'construction',
            }
            location_type = type_mapping.get(report.report_type)
            if location_type:
                MapLocation.objects.create(
                    name=report.title,
                    location_type=location_type,
                    gps_lat=report.gps_lat,
                    gps_lng=report.gps_lng,
                    description=report.description,
                    added_by=request.user,
                    source='community',
                    community_report=report,
                )

        # Notify reporter
        from notifications.models import Notification
        Notification.objects.create(
            user=report.reporter,
            title=f'Report {action.title()}',
            message=f'Your report "{report.title}" has been {action}.',
            notification_type='report',
            related_object_id=report.id,
        )

        return Response({
            'message': f'Report {action}.',
            'report': CommunityReportSerializer(report).data,
        })
