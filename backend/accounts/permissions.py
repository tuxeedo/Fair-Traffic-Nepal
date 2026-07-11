from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsOfficer(BasePermission):
    """Allow access only to traffic officers."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'officer'
        )


class IsCitizen(BasePermission):
    """Allow access only to citizens."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'citizen'
        )


class IsOfficerOrAdmin(BasePermission):
    """Allow access to officers and admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('officer', 'admin')
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow access to the object owner or admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # Check common owner field names
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'citizen'):
            return obj.citizen == request.user
        if hasattr(obj, 'driver'):
            return obj.driver == request.user
        return False
