from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone

from accounts.permissions import IsAdmin, IsOfficerOrAdmin, IsCitizen
from vehicles.models import Vehicle
from .models import (
    ViolationType, TrafficRule, Violation, Warning,
    SafetyScore, SafetyScoreHistory, CommunityService,
)
from .serializers import (
    ViolationTypeSerializer, TrafficRuleSerializer,
    ViolationSerializer, RecordViolationSerializer,
    SafetyScoreSerializer, SafetyScoreHistorySerializer,
    WarningSerializer, PayFineSerializer, CommunityServiceSerializer,
)
from .rule_engine import evaluate_violation, update_safety_score

User = get_user_model()


# ─── Violation Types ─────────────────────────────────────────────────────────

class ViolationTypeListView(generics.ListCreateAPIView):
    """List violation types (all users) or create new types (admin only)."""

    serializer_class = ViolationTypeSerializer
    queryset = ViolationType.objects.all()
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'code']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class ViolationTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: manage a single violation type."""

    serializer_class = ViolationTypeSerializer
    permission_classes = [IsAdmin]
    queryset = ViolationType.objects.all()


# ─── Traffic Rules ───────────────────────────────────────────────────────────

class TrafficRuleListView(generics.ListCreateAPIView):
    """List all traffic rules or create new ones (admin only)."""

    serializer_class = TrafficRuleSerializer
    queryset = TrafficRule.objects.select_related('violation_type').all()
    filterset_fields = ['violation_type', 'action', 'is_immediate']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class TrafficRuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: manage a single traffic rule."""

    serializer_class = TrafficRuleSerializer
    permission_classes = [IsAdmin]
    queryset = TrafficRule.objects.all()


# ─── Record Violation ────────────────────────────────────────────────────────

class RuleEnginePreviewView(APIView):
    """
    Officer: preview what the rule engine recommends before confirming.
    POST { driver_id, violation_type_id }
    """

    permission_classes = [IsOfficerOrAdmin]

    def post(self, request):
        driver_id = request.data.get('driver_id')
        violation_type_id = request.data.get('violation_type_id')

        try:
            driver = User.objects.get(id=driver_id, role='citizen')
            v_type = ViolationType.objects.get(id=violation_type_id, is_active=True)
        except (User.DoesNotExist, ViolationType.DoesNotExist):
            return Response(
                {'error': 'Invalid driver or violation type.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        recommendation = evaluate_violation(driver, v_type)
        return Response({
            'recommendation': {
                'action': recommendation['action'],
                'fine_amount': str(recommendation['fine_amount']),
                'offense_number': recommendation['offense_number'],
                'reason': recommendation['reason'],
            },
            'driver': {
                'id': driver.id,
                'name': driver.get_full_name(),
                'license_number': driver.license_number,
            },
            'violation_type': ViolationTypeSerializer(v_type).data,
        })


class RecordViolationView(APIView):
    """
    Officer: record a new violation.
    The rule engine evaluates and recommends action;
    the officer can optionally override.
    """

    permission_classes = [IsOfficerOrAdmin]

    def post(self, request):
        serializer = RecordViolationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        driver = User.objects.get(id=data['driver_id'])
        v_type = ViolationType.objects.get(id=data['violation_type_id'])
        vehicle = None
        if data.get('vehicle_id'):
            vehicle = Vehicle.objects.filter(id=data['vehicle_id']).first()

        # Rule engine evaluation
        recommendation = evaluate_violation(driver, v_type)

        # Officer override
        action = data.get('override_action', recommendation['action'])
        fine_amount = recommendation['fine_amount'] if action == 'fine' else 0

        # Create violation record
        violation = Violation.objects.create(
            driver=driver,
            vehicle=vehicle,
            officer=request.user,
            violation_type=v_type,
            action_taken=action,
            fine_amount=fine_amount,
            gps_lat=data.get('gps_lat'),
            gps_lng=data.get('gps_lng'),
            location_description=data.get('location_description', ''),
            officer_remarks=data.get('officer_remarks', ''),
            rule_applied=recommendation['rule_applied'],
        )

        # Create warning record if action is warning
        if action == 'warning':
            Warning.objects.create(
                violation=violation,
                message=(
                    f'You have received a formal warning for: {v_type.name}. '
                    f'This is offense #{recommendation["offense_number"]}. '
                    f'Future violations may result in a fine.'
                ),
            )

        # Update safety score
        update_safety_score(driver, violation, action)

        return Response(
            {
                'message': f'Violation recorded. Action: {action}.',
                'violation': ViolationSerializer(violation).data,
                'recommendation': recommendation['reason'],
            },
            status=status.HTTP_201_CREATED,
        )


# ─── Violation History ───────────────────────────────────────────────────────

class MyViolationsView(generics.ListAPIView):
    """Citizen: view own violation history."""

    serializer_class = ViolationSerializer
    permission_classes = [IsCitizen]
    filterset_fields = ['action_taken', 'is_paid', 'violation_type']
    ordering_fields = ['created_at', 'fine_amount']

    def get_queryset(self):
        return Violation.objects.filter(
            driver=self.request.user
        ).select_related('violation_type', 'officer', 'vehicle', 'warning')


class ViolationDetailView(generics.RetrieveAPIView):
    """View violation details — owner, issuing officer, or admin."""

    serializer_class = ViolationSerializer
    queryset = Violation.objects.select_related(
        'violation_type', 'officer', 'vehicle', 'driver', 'warning'
    )

    def get_permissions(self):
        return [permissions.IsAuthenticated()]


class AllViolationsView(generics.ListAPIView):
    """Admin: list all violations with filtering."""

    serializer_class = ViolationSerializer
    permission_classes = [IsAdmin]
    queryset = Violation.objects.select_related(
        'violation_type', 'officer', 'vehicle', 'driver'
    ).all()
    filterset_fields = ['action_taken', 'is_paid', 'violation_type', 'officer', 'driver']
    search_fields = ['driver__first_name', 'driver__last_name', 'location_description']
    ordering_fields = ['created_at', 'fine_amount']


class DriverViolationsView(generics.ListAPIView):
    """Officer/Admin: view violations for a specific driver."""

    serializer_class = ViolationSerializer
    permission_classes = [IsOfficerOrAdmin]

    def get_queryset(self):
        driver_id = self.kwargs['driver_id']
        return Violation.objects.filter(
            driver_id=driver_id
        ).select_related('violation_type', 'officer', 'vehicle', 'warning')


# ─── Warnings ────────────────────────────────────────────────────────────────

class MyWarningsView(generics.ListAPIView):
    """Citizen: view own warnings."""

    serializer_class = WarningSerializer
    permission_classes = [IsCitizen]

    def get_queryset(self):
        return Warning.objects.filter(
            violation__driver=self.request.user
        ).select_related('violation')


class AcknowledgeWarningView(APIView):
    """Citizen: acknowledge a warning."""

    permission_classes = [IsCitizen]

    def post(self, request, pk):
        try:
            warning = Warning.objects.get(pk=pk, violation__driver=request.user)
        except Warning.DoesNotExist:
            return Response(
                {'error': 'Warning not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        warning.acknowledged = True
        warning.acknowledged_at = timezone.now()
        warning.save()
        return Response({'message': 'Warning acknowledged.'})


# ─── Pay Fine ────────────────────────────────────────────────────────────────

class PayFineView(APIView):
    """Citizen: simulate fine payment."""

    permission_classes = [IsCitizen]

    def post(self, request, pk):
        try:
            violation = Violation.objects.get(
                pk=pk, driver=request.user, action_taken='fine', is_paid=False
            )
        except Violation.DoesNotExist:
            return Response(
                {'error': 'Unpaid fine not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PayFineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        violation.is_paid = True
        violation.paid_at = timezone.now()
        violation.save()

        return Response({
            'message': 'Fine paid successfully.',
            'amount': str(violation.fine_amount),
            'payment_method': serializer.validated_data['payment_method'],
        })


# ─── Safety Score ────────────────────────────────────────────────────────────

class MySafetyScoreView(APIView):
    """Citizen: view own safety score."""

    permission_classes = [IsCitizen]

    def get(self, request):
        from django.conf import settings as conf
        score, created = SafetyScore.objects.get_or_create(
            driver=request.user,
            defaults={'current_score': conf.SAFETY_SCORE_INITIAL},
        )
        return Response(SafetyScoreSerializer(score).data)


class MySafetyScoreHistoryView(generics.ListAPIView):
    """Citizen: view safety score change history."""

    serializer_class = SafetyScoreHistorySerializer
    permission_classes = [IsCitizen]

    def get_queryset(self):
        return SafetyScoreHistory.objects.filter(driver=self.request.user)


class DriverSafetyScoreView(APIView):
    """Officer/Admin: view a driver's safety score."""

    permission_classes = [IsOfficerOrAdmin]

    def get(self, request, driver_id):
        from django.conf import settings as conf
        try:
            driver = User.objects.get(id=driver_id)
        except User.DoesNotExist:
            return Response({'error': 'Driver not found.'}, status=404)
        score, _ = SafetyScore.objects.get_or_create(
            driver=driver,
            defaults={'current_score': conf.SAFETY_SCORE_INITIAL},
        )
        return Response(SafetyScoreSerializer(score).data)

# ─── Community Service ───────────────────────────────────────────────────────

class MyCommunityServiceView(generics.ListAPIView):
    """Citizen: view own assigned community service."""
    serializer_class = CommunityServiceSerializer
    permission_classes = [IsCitizen]

    def get_queryset(self):
        return CommunityService.objects.filter(driver=self.request.user).order_by('-created_at')

class AllCommunityServiceView(generics.ListAPIView):
    """Admin/Officer: view all community service records."""
    serializer_class = CommunityServiceSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = CommunityService.objects.all().order_by('-created_at')
    filterset_fields = ['status']
    search_fields = ['driver__first_name', 'driver__last_name']

class UpdateCommunityServiceView(generics.UpdateAPIView):
    """Admin/Officer: update community service hours."""
    serializer_class = CommunityServiceSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = CommunityService.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        completed_hours = request.data.get('completed_hours')
        
        if completed_hours is not None:
            instance.completed_hours = min(int(completed_hours), instance.assigned_hours)
            if instance.completed_hours >= instance.assigned_hours:
                instance.status = CommunityService.Status.COMPLETED
            elif instance.completed_hours > 0:
                instance.status = CommunityService.Status.IN_PROGRESS
            instance.save()
            return Response(self.get_serializer(instance).data)
        
        return Response({'error': 'completed_hours is required'}, status=status.HTTP_400_BAD_REQUEST)

class CreateCommunityServiceView(generics.CreateAPIView):
    """Admin/Officer: Manually assign community service."""
    serializer_class = CommunityServiceSerializer
    permission_classes = [IsOfficerOrAdmin]

    def perform_create(self, serializer):
        violation_id = self.request.data.get('violation_id')
        violation = generics.get_object_or_404(Violation, id=violation_id)
        serializer.save(violation=violation, driver=violation.driver)
