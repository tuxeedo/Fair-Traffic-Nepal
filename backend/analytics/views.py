"""
Analytics views providing aggregated dashboard data.
Admin-only endpoints for charts, heatmaps, and reports.
"""

from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Sum, Q, F
from django.db.models.functions import TruncDate, TruncMonth
from django.contrib.auth import get_user_model

from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsOfficerOrAdmin
from violations.models import Violation, ViolationType
from appeals.models import Appeal
from reports.models import CommunityReport

User = get_user_model()


class DashboardSummaryView(APIView):
    """Admin: high-level summary statistics."""

    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        thirty_days_ago = today - timedelta(days=30)

        total_violations = Violation.objects.count()
        violations_this_month = Violation.objects.filter(
            created_at__date__gte=thirty_days_ago
        ).count()
        total_warnings = Violation.objects.filter(action_taken='warning').count()
        total_fines = Violation.objects.filter(action_taken='fine').count()
        unpaid_fines = Violation.objects.filter(
            action_taken='fine', is_paid=False
        ).count()
        total_revenue = Violation.objects.filter(
            action_taken='fine', is_paid=True
        ).aggregate(total=Sum('fine_amount'))['total'] or 0
        pending_appeals = Appeal.objects.filter(status='pending').count()
        pending_reports = CommunityReport.objects.filter(status='pending').count()
        total_users = User.objects.filter(role='citizen').count()
        total_officers = User.objects.filter(role='officer').count()

        return Response({
            'total_violations': total_violations,
            'violations_this_month': violations_this_month,
            'total_warnings': total_warnings,
            'total_fines': total_fines,
            'unpaid_fines': unpaid_fines,
            'total_revenue': str(total_revenue),
            'pending_appeals': pending_appeals,
            'pending_reports': pending_reports,
            'total_citizens': total_users,
            'total_officers': total_officers,
        })


class DailyViolationsView(APIView):
    """Admin: daily violation counts for the last 30 days."""

    permission_classes = [IsAdmin]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now().date() - timedelta(days=days)

        data = (
            Violation.objects.filter(created_at__date__gte=start_date)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(
                total=Count('id'),
                warnings=Count('id', filter=Q(action_taken='warning')),
                fines=Count('id', filter=Q(action_taken='fine')),
            )
            .order_by('date')
        )

        return Response(list(data))


class MonthlyViolationsView(APIView):
    """Admin: monthly violation counts for the last 12 months."""

    permission_classes = [IsAdmin]

    def get(self, request):
        months = int(request.query_params.get('months', 12))
        start_date = timezone.now().date() - timedelta(days=months * 30)

        data = (
            Violation.objects.filter(created_at__date__gte=start_date)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(
                total=Count('id'),
                warnings=Count('id', filter=Q(action_taken='warning')),
                fines=Count('id', filter=Q(action_taken='fine')),
            )
            .order_by('month')
        )

        return Response(list(data))


class ViolationsByTypeView(APIView):
    """Admin: violation counts grouped by type."""

    permission_classes = [IsAdmin]

    def get(self, request):
        data = (
            Violation.objects
            .values('violation_type__name', 'violation_type__category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        return Response(list(data))


class TopOffendersView(APIView):
    """Admin: top repeat offenders."""

    permission_classes = [IsAdmin]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        data = (
            Violation.objects
            .values(
                'driver__id',
                'driver__first_name',
                'driver__last_name',
                'driver__license_number',
            )
            .annotate(
                violation_count=Count('id'),
                total_fines=Sum('fine_amount', filter=Q(action_taken='fine')),
            )
            .order_by('-violation_count')[:limit]
        )
        return Response(list(data))


class ViolationHeatmapView(APIView):
    """Admin: violation GPS data for heatmap rendering."""

    permission_classes = [IsAdmin]

    def get(self, request):
        data = (
            Violation.objects
            .filter(gps_lat__isnull=False, gps_lng__isnull=False)
            .values('gps_lat', 'gps_lng', 'violation_type__name')
            .annotate(intensity=Count('id'))
        )
        return Response(list(data))


class OfficerPerformanceView(APIView):
    """Admin: officer performance statistics."""

    permission_classes = [IsAdmin]

    def get(self, request):
        officers = User.objects.filter(role='officer').values(
            'id', 'first_name', 'last_name'
        )

        result = []
        for officer in officers:
            oid = officer['id']
            violations = Violation.objects.filter(officer_id=oid)
            appeals_overturned = Appeal.objects.filter(
                violation__officer_id=oid, status='accepted'
            ).count()

            result.append({
                'officer_id': oid,
                'name': f"{officer['first_name']} {officer['last_name']}",
                'warnings_issued': violations.filter(action_taken='warning').count(),
                'fines_issued': violations.filter(action_taken='fine').count(),
                'total_violations': violations.count(),
                'appeals_overturned': appeals_overturned,
            })

        return Response(sorted(result, key=lambda x: x['total_violations'], reverse=True))


class AppealStatsView(APIView):
    """Admin: appeal statistics."""

    permission_classes = [IsAdmin]

    def get(self, request):
        total = Appeal.objects.count()
        by_status = dict(
            Appeal.objects
            .values_list('status')
            .annotate(count=Count('id'))
            .values_list('status', 'count')
        )

        return Response({
            'total': total,
            'pending': by_status.get('pending', 0),
            'under_review': by_status.get('under_review', 0),
            'accepted': by_status.get('accepted', 0),
            'rejected': by_status.get('rejected', 0),
            'acceptance_rate': (
                round(by_status.get('accepted', 0) / total * 100, 1) if total > 0 else 0
            ),
        })


class ReportStatsView(APIView):
    """Admin: community report statistics."""

    permission_classes = [IsAdmin]

    def get(self, request):
        total = CommunityReport.objects.count()

        by_type = list(
            CommunityReport.objects
            .values('report_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        by_status = dict(
            CommunityReport.objects
            .values_list('status')
            .annotate(count=Count('id'))
            .values_list('status', 'count')
        )

        return Response({
            'total': total,
            'by_type': by_type,
            'pending': by_status.get('pending', 0),
            'approved': by_status.get('approved', 0),
            'rejected': by_status.get('rejected', 0),
        })
