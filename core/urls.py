"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.http import HttpResponse

from core import settings

# Simple health check view
def health_check(request):
    return HttpResponse("OK", content_type="text/plain")

urlpatterns = [
    path('backend/admin', admin.site.urls),
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/personil/', include('personnel_database.urls')),
    path('api/v1/staffing-status/', include('staffing_status.urls')),
    path('api/v1/organizational-structure/', include('organizational_structure.urls')),
    path('api/v1/person-detail/', include('person_detail.urls')),
    path('api/v1/permohonan/', include('permohonan.urls')),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    path('health/', health_check, name='health_check'),
]