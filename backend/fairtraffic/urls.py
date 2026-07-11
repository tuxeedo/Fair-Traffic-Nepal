"""
FairTraffic URL Configuration.

All API endpoints are namespaced under /api/v1/.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/vehicles/', include('vehicles.urls')),
    path('api/v1/violations/', include('violations.urls')),
    path('api/v1/evidence/', include('evidence.urls')),
    path('api/v1/appeals/', include('appeals.urls')),
    path('api/v1/reports/', include('reports.urls')),
    path('api/v1/locations/', include('locations.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/audit/', include('audit.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
