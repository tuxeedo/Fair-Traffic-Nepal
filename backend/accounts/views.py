from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from notifications.models import Notification
from audit.models import AuditLog

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    UserListSerializer,
    OfficerProfileSerializer,
    OfficerCreateSerializer,
    CorrectionRequestSerializer,
    CorrectionRequestReviewSerializer,
)
from .permissions import IsAdmin, IsOfficerOrAdmin, IsOwnerOrAdmin
from .models import OfficerProfile, CorrectionRequest, GovernmentCitizenRecord

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login endpoint that accepts either username OR email address.
    """
    serializer_class = CustomTokenObtainPairSerializer


class VerifyIdentityView(APIView):
    """
    Public endpoint: verifies citizen identity against GovernmentCitizenRecord.
    Requires BOTH identity_number AND date_of_birth to prevent enumeration/stalking attacks.
    Returns generic "The information could not be verified." on any mismatch.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identity_type = request.data.get('identity_type', 'citizenship').strip().lower()
        number = request.data.get('identity_number', '').strip()
        dob_str = request.data.get('date_of_birth', '').strip()

        if not number or not dob_str:
            return Response(
                {'detail': 'The information could not be verified.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        raw_digits = ''.join(c for c in number if c.isdigit())

        candidates = []
        if identity_type == 'nid':
            qs = GovernmentCitizenRecord.objects.filter(nid_number__icontains=number)
            candidates = list(qs)
            if not candidates and raw_digits:
                for r in GovernmentCitizenRecord.objects.all():
                    if ''.join(c for c in r.nid_number if c.isdigit()) == raw_digits:
                        candidates.append(r)
        else:
            qs = GovernmentCitizenRecord.objects.filter(citizenship_number__icontains=number)
            candidates = list(qs)
            if not candidates and raw_digits:
                for r in GovernmentCitizenRecord.objects.all():
                    if ''.join(c for c in r.citizenship_number if c.isdigit()) == raw_digits:
                        candidates.append(r)

        # Require strict match on BOTH document number AND Date of Birth
        matching_record = None
        for candidate in candidates:
            if candidate.date_of_birth.strftime('%Y-%m-%d') == dob_str:
                matching_record = candidate
                break

        # Privacy protection: Never leak whether number exists or DOB was wrong
        if not matching_record:
            return Response(
                {'detail': 'The information could not be verified.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if already registered to a user account
        if matching_record.is_registered or User.objects.filter(citizen_record=matching_record).exists() or User.objects.filter(citizenship_number=matching_record.citizenship_number).exists() or User.objects.filter(nid_number=matching_record.nid_number).exists():
            return Response(
                {'detail': 'An account is already registered for this citizen record. Please sign in.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'record_id': matching_record.id,
            'full_name': matching_record.full_name,
            'first_name': matching_record.first_name,
            'last_name': matching_record.last_name,
            'phone': matching_record.phone or '',
            'date_of_birth': matching_record.date_of_birth.strftime('%Y-%m-%d'),
            'citizenship_number': matching_record.citizenship_number,
            'nid_number': matching_record.nid_number,
            'license_number': matching_record.license_number or '',
            'address': matching_record.address or '',
            'verified': True,
        })






class RegisterView(generics.CreateAPIView):
    """Public endpoint for citizen registration."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'Registration successful.',
                'user': UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user's profile."""

    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change the authenticated user's password."""

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password updated successfully.'})


class UserListView(generics.ListAPIView):
    """Admin-only: list all users with filtering."""

    serializer_class = UserListSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all()
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['date_joined', 'username']


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin-only: view, update, or deactivate a user."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all()

    def perform_destroy(self, instance):
        # Soft-delete: deactivate instead of deleting
        instance.is_active = False
        instance.save()


class OfficerListView(generics.ListCreateAPIView):
    """Admin-only: list all officers or create new officer accounts."""

    permission_classes = [IsAdmin]
    queryset = OfficerProfile.objects.select_related('user').all()
    search_fields = ['badge_number', 'station', 'user__first_name', 'user__last_name']
    ordering_fields = ['badge_number', 'station']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OfficerCreateSerializer
        return OfficerProfileSerializer


class OfficerDetailView(generics.RetrieveAPIView):
    """View officer profile details — accessible by officers and admins."""

    serializer_class = OfficerProfileSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = OfficerProfile.objects.select_related('user').all()


class DriverSearchView(generics.ListAPIView):
    """Officer/Admin: search for drivers by license number or name."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsOfficerOrAdmin]
    queryset = User.objects.filter(role='citizen')
    search_fields = ['license_number', 'first_name', 'last_name', 'citizenship_number', 'phone']


class CorrectionRequestListCreateView(generics.ListCreateAPIView):
    """
    List and create correction requests.
    Citizens view their own requests; Admins view all requests (filtered by status).
    """

    serializer_class = CorrectionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            queryset = CorrectionRequest.objects.select_related('user', 'reviewed_by').all()
            status_param = self.request.query_params.get('status')
            if status_param:
                queryset = queryset.filter(status=status_param)
            return queryset
        return CorrectionRequest.objects.filter(user=user).select_related('reviewed_by').all()

    def perform_create(self, serializer):
        correction = serializer.save(user=self.request.user)

        from notifications.models import Notification

        # Notify citizen
        Notification.objects.create(
            user=self.request.user,
            title='Profile Correction Requested',
            message=f'Your request to update {correction.get_field_name_display()} has been submitted for admin review.',
            notification_type='system',
            related_object_id=correction.id,
        )

        # Notify admins
        for admin_user in User.objects.filter(role='admin', is_active=True):
            Notification.objects.create(
                user=admin_user,
                title='New Profile Correction Request',
                message=f'Citizen {self.request.user.get_full_name()} requested a profile correction for {correction.get_field_name_display()}.',
                notification_type='system',
                related_object_id=correction.id,
            )


class CorrectionRequestDetailView(generics.RetrieveAPIView):
    """Retrieve details of a specific profile correction request."""

    serializer_class = CorrectionRequestSerializer
    permission_classes = [IsOwnerOrAdmin]
    queryset = CorrectionRequest.objects.select_related('user', 'reviewed_by').all()


class CorrectionRequestReviewView(APIView):
    """
    Admin-only: Approve or reject a user's profile correction request.
    If approved, automatically updates the corresponding profile attribute on the User model.
    """

    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            correction = CorrectionRequest.objects.select_related('user').get(pk=pk)
        except CorrectionRequest.DoesNotExist:
            return Response({'detail': 'Correction request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if correction.status != CorrectionRequest.Status.PENDING:
            return Response(
                {'detail': f'Correction request has already been reviewed ({correction.status}).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CorrectionRequestReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        rejection_reason = serializer.validated_data.get('rejection_reason', '')

        if action == 'approve':
            # Update actual user profile field
            user_obj = correction.user
            setattr(user_obj, correction.field_name, correction.requested_value)
            user_obj.save()

            correction.status = CorrectionRequest.Status.APPROVED
            correction.reviewed_by = request.user
            correction.reviewed_at = timezone.now()
            correction.save()

            # Create notification
            Notification.objects.create(
                user=user_obj,
                title="Profile Correction Approved",
                message=f"Your request to update your {correction.get_field_name_display()} to '{correction.requested_value}' has been approved.",
                notification_type=Notification.NotificationType.SYSTEM,
                related_object_id=correction.id,
            )

            # Create audit log
            AuditLog.objects.create(
                user=request.user,
                action="correction_request_approved",
                model_name="CorrectionRequest",
                object_id=str(correction.id),
                details={
                    'user_id': user_obj.id,
                    'field_name': correction.field_name,
                    'new_value': correction.requested_value,
                },
            )

            return Response({
                'message': f'Correction request for {correction.get_field_name_display()} approved successfully.',
                'correction': CorrectionRequestSerializer(correction).data,
            })

        else:  # reject
            correction.status = CorrectionRequest.Status.REJECTED
            correction.rejection_reason = rejection_reason
            correction.reviewed_by = request.user
            correction.reviewed_at = timezone.now()
            correction.save()

            # Create notification
            Notification.objects.create(
                user=correction.user,
                title="Profile Correction Rejected",
                message=f"Your request to update your {correction.get_field_name_display()} was rejected. Reason: {rejection_reason}",
                notification_type=Notification.NotificationType.SYSTEM,
                related_object_id=correction.id,
            )

            # Create audit log
            AuditLog.objects.create(
                user=request.user,
                action="correction_request_rejected",
                model_name="CorrectionRequest",
                object_id=str(correction.id),
                details={
                    'user_id': correction.user.id,
                    'field_name': correction.field_name,
                    'rejection_reason': rejection_reason,
                },
            )

            return Response({
                'message': f'Correction request rejected.',
                'correction': CorrectionRequestSerializer(correction).data,
            })

