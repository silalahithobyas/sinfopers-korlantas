from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PermohonanViewSet

router = DefaultRouter()
router.register(r'', PermohonanViewSet, basename='permohonan')

urlpatterns = [
    path('', include(router.urls)),
] 