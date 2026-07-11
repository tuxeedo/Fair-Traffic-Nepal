from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    UserListSerializer,
    OfficerProfileSerializer,
    OfficerCreateSerializer,
)
from .permissions import IsAdmin, IsOfficerOrAdmin
from .models import OfficerProfile

User = get_user_model()


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
