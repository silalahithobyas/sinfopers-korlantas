from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Permohonan
from .serializers import PermohonanSerializer, PermohonanHRSerializer, PermohonanPimpinanSerializer
from authentication.models import AuthUser

class IsHR(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == AuthUser.HR

class IsPimpinan(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == AuthUser.PIMPINAN

class PermohonanViewSet(viewsets.ModelViewSet):
    serializer_class = PermohonanSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Jika user adalah anggota, hanya lihat permohonan miliknya
        if user.role == AuthUser.ANGGOTA:
            return Permohonan.objects.filter(personel=user)
        
        # HR melihat permohonan dengan status pending_hr
        elif user.role == AuthUser.HR:
            return Permohonan.objects.filter(status=Permohonan.StatusPermohonan.PENDING_HR)
        
        # Pimpinan melihat permohonan dengan status pending_pimpinan
        elif user.role == AuthUser.PIMPINAN:
            return Permohonan.objects.filter(status=Permohonan.StatusPermohonan.PENDING_PIMPINAN)
        
        # Admin melihat semua permohonan
        elif user.is_staff or user.is_superuser:
            return Permohonan.objects.all()
        
        return Permohonan.objects.none()
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            # Hanya user yang membuat permohonan yang bisa mengubah/hapus
            return [permissions.IsAuthenticated()]
        elif self.action == 'hr_review':
            # Hanya HR yang bisa mereview
            return [IsHR()]
        elif self.action == 'pimpinan_review':
            # Hanya pimpinan yang bisa mereview
            return [IsPimpinan()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(personel=self.request.user)
    
    @action(detail=True, methods=['post'], url_path='hr-review')
    def hr_review(self, request, pk=None):
        permohonan = self.get_object()
        
        # Hanya bisa mereview jika status pending_hr
        if permohonan.status != Permohonan.StatusPermohonan.PENDING_HR:
            return Response(
                {"detail": "Hanya bisa mereview permohonan dengan status menunggu persetujuan HR"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PermohonanHRSerializer(permohonan, data=request.data, partial=True)
        if serializer.is_valid():
            # Jika disetujui HR, ubah status ke pending_pimpinan
            if request.data.get('status') == 'disetujui':
                serializer.save(status=Permohonan.StatusPermohonan.PENDING_PIMPINAN)
            else:
                serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='pimpinan-review')
    def pimpinan_review(self, request, pk=None):
        permohonan = self.get_object()
        
        # Hanya bisa mereview jika status pending_pimpinan
        if permohonan.status != Permohonan.StatusPermohonan.PENDING_PIMPINAN:
            return Response(
                {"detail": "Hanya bisa mereview permohonan dengan status menunggu persetujuan Pimpinan"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PermohonanPimpinanSerializer(permohonan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
