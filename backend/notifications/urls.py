from django.urls import path
from . import views

urlpatterns = [
    path('my/', views.MyNotificationsView.as_view(), name='my_notifications'),
    path('unread-count/', views.UnreadCountView.as_view(), name='unread_count'),
    path('<int:pk>/read/', views.MarkReadView.as_view(), name='mark_read'),
    path('read-all/', views.MarkAllReadView.as_view(), name='mark_all_read'),
]
