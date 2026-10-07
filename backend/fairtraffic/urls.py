"""
FairTraffic URL Configuration.

All API endpoints are namespaced under /api/v1/.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.shortcuts import redirect


def api_root(request):
    """If browser request, redirect directly to Django Admin panel /admin/; otherwise return JSON status."""
    if 'text/html' in request.META.get('HTTP_ACCEPT', ''):
        return redirect('/admin/')
    return JsonResponse({
        "system": "FairTraffic Nepal - Smart Traffic Violation Management Backend",
        "version": "1.0.0",
        "status": "online",
        "frontend_portal": "http://localhost:5173/",
        "admin_portal": "http://localhost:8000/admin/",
        "endpoints": {
            "admin_panel": "/admin/",
            "accounts": "/api/v1/accounts/",
            "vehicles": "/api/v1/vehicles/",
            "violations": "/api/v1/violations/",
            "evidence": "/api/v1/evidence/",
            "appeals": "/api/v1/appeals/",
            "reports": "/api/v1/reports/",
            "locations": "/api/v1/locations/",
            "notifications": "/api/v1/notifications/",
            "analytics": "/api/v1/analytics/",
            "audit": "/api/v1/audit/",
        }
    })



urlpatterns = [
    path('', api_root, name='api-root'),
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
