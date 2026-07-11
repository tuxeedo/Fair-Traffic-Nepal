from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class MyNotificationsView(generics.ListAPIView):
    """List notifications for the authenticated user."""

    serializer_class = NotificationSerializer
    filterset_fields = ['notification_type', 'is_read']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class UnreadCountView(APIView):
    """Get unread notification count."""

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user, is_read=False
        ).count()
        return Response({'unread_count': count})


class MarkReadView(APIView):
    """Mark a notification as read."""

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Marked as read.'})


class MarkAllReadView(APIView):
    """Mark all notifications as read for the current user."""

    def post(self, request):
        updated = Notification.objects.filter(
            user=request.user, is_read=False
        ).update(is_read=True)
        return Response({'message': f'{updated} notifications marked as read.'})
