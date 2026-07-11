from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

from accounts.permissions import IsAdmin, IsCitizen
from violations.rule_engine import restore_safety_score
from .models import Appeal, Complaint
from .serializers import (
    AppealSerializer, SubmitAppealSerializer, ReviewAppealSerializer,
    ComplaintSerializer, SubmitComplaintSerializer, ReviewComplaintSerializer
)


class SubmitAppealView(generics.CreateAPIView):
    """Citizen: submit an appeal for a violation."""

    serializer_class = SubmitAppealSerializer
    permission_classes = [IsCitizen]

    def perform_create(self, serializer):
        serializer.save(citizen=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appeal = serializer.save(citizen=request.user)

        # Create notification
        from notifications.models import Notification
        Notification.objects.create(
            user=request.user,
            title='Appeal Submitted',
            message=f'Your appeal for violation #{appeal.violation_id} has been submitted and is pending review.',
            notification_type='appeal',
            related_object_id=appeal.id,
        )

        return Response(
            AppealSerializer(appeal).data,
            status=status.HTTP_201_CREATED,
        )


class MyAppealsView(generics.ListAPIView):
    """Citizen: view own appeals."""

    serializer_class = AppealSerializer
    permission_classes = [IsCitizen]
    filterset_fields = ['status']

    def get_queryset(self):
        return Appeal.objects.filter(
            citizen=self.request.user
        ).select_related('violation__violation_type', 'reviewed_by')


class AppealDetailView(generics.RetrieveAPIView):
    """View appeal details."""

    serializer_class = AppealSerializer
    queryset = Appeal.objects.select_related(
        'violation__violation_type', 'citizen', 'reviewed_by'
    )


class AllAppealsView(generics.ListAPIView):
    """Admin: list all appeals with filtering."""

    serializer_class = AppealSerializer
    permission_classes = [IsAdmin]
    queryset = Appeal.objects.select_related(
        'violation__violation_type', 'citizen', 'reviewed_by'
    ).all()
    filterset_fields = ['status']
    search_fields = ['citizen__first_name', 'citizen__last_name', 'reason']
    ordering_fields = ['created_at', 'status']


class ReviewAppealView(APIView):
    """Admin: accept or reject an appeal."""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            appeal = Appeal.objects.select_related('violation', 'citizen').get(pk=pk)
        except Appeal.DoesNotExist:
            return Response({'error': 'Appeal not found.'}, status=404)

        if appeal.status not in ('pending', 'under_review'):
            return Response(
                {'error': 'This appeal has already been reviewed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReviewAppealSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        remarks = serializer.validated_data['admin_remarks']

        appeal.status = action
        appeal.admin_remarks = remarks
        appeal.reviewed_by = request.user
        appeal.reviewed_at = timezone.now()
        appeal.save()

        # If accepted: waive the fine and restore safety score
        if action == 'accepted':
            violation = appeal.violation
            violation.is_paid = True  # Mark as resolved
            violation.save()
            restore_safety_score(appeal.citizen, violation)

        # Notify citizen
        from notifications.models import Notification
        status_display = 'accepted' if action == 'accepted' else 'rejected'
        Notification.objects.create(
            user=appeal.citizen,
            title=f'Appeal {status_display.title()}',
            message=(
                f'Your appeal for violation #{appeal.violation_id} has been {status_display}. '
                f'Admin remarks: {remarks}'
            ),
            notification_type='appeal',
            related_object_id=appeal.id,
        )

        # Log audit
        from audit.models import AuditLog
        AuditLog.objects.create(
            user=request.user,
            action=f'appeal_{action}',
            model_name='Appeal',
            object_id=str(appeal.id),
            details={
                'violation_id': appeal.violation_id,
                'citizen': appeal.citizen.get_full_name(),
                'remarks': remarks,
            },
        )

        return Response({
            'message': f'Appeal {status_display}.',
            'appeal': AppealSerializer(appeal).data,
        })


class SubmitComplaintView(generics.CreateAPIView):
    """Citizen: submit a complaint about an officer."""

    serializer_class = SubmitComplaintSerializer
    permission_classes = [IsCitizen]

    def perform_create(self, serializer):
        serializer.save(citizen=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save(citizen=request.user)

        # Create notification for the citizen
        from notifications.models import Notification
        Notification.objects.create(
            user=request.user,
            title='Complaint Filed',
            message=f'Your complaint against Officer {complaint.officer.get_full_name()} has been filed.',
            notification_type='appeal',
            related_object_id=complaint.id,
        )

        return Response(
            ComplaintSerializer(complaint).data,
            status=status.HTTP_201_CREATED,
        )


class MyComplaintsView(generics.ListAPIView):
    """Citizen: view own filed complaints."""

    serializer_class = ComplaintSerializer
    permission_classes = [IsCitizen]
    filterset_fields = ['status']

    def get_queryset(self):
        return Complaint.objects.filter(citizen=self.request.user).select_related('officer', 'violation__violation_type')


class AllComplaintsView(generics.ListAPIView):
    """Admin: list all complaints."""

    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]
    queryset = Complaint.objects.select_related('citizen', 'officer', 'violation__violation_type').all()
    filterset_fields = ['status']
    search_fields = ['citizen__first_name', 'citizen__last_name', 'officer__first_name', 'officer__last_name', 'subject']
    ordering_fields = ['created_at', 'status']


class ComplaintDetailView(generics.RetrieveAPIView):
    """View details of a specific complaint."""

    serializer_class = ComplaintSerializer
    queryset = Complaint.objects.select_related('citizen', 'officer', 'violation__violation_type').all()


class ReviewComplaintView(APIView):
    """Admin: resolve or dismiss a complaint."""

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            complaint = Complaint.objects.select_related('citizen', 'officer').get(pk=pk)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found.'}, status=404)

        serializer = ReviewComplaintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        remarks = serializer.validated_data['admin_remarks']

        complaint.status = action
        complaint.admin_remarks = remarks
        complaint.reviewed_by = request.user
        complaint.save()

        # Notify citizen
        from notifications.models import Notification
        Notification.objects.create(
            user=complaint.citizen,
            title='Complaint Updated',
            message=f'Your complaint against Officer {complaint.officer.get_full_name()} has been marked as {action}. remarks: {remarks}',
            notification_type='appeal',
            related_object_id=complaint.id,
        )

        # Log audit
        from audit.models import AuditLog
        AuditLog.objects.create(
            user=request.user,
            action=f'complaint_{action}',
            model_name='Complaint',
            object_id=str(complaint.id),
            details={
                'officer': complaint.officer.get_full_name(),
                'citizen': complaint.citizen.get_full_name(),
                'remarks': remarks,
            },
        )

        return Response({
            'message': f'Complaint status updated to {action}.',
            'complaint': ComplaintSerializer(complaint).data,
        })
