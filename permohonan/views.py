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
        
        # Pimpinan melihat permohonan dengan status valid (sudah divalidasi HR)
        elif user.role == AuthUser.PIMPINAN:
            return Permohonan.objects.filter(status=Permohonan.StatusPermohonan.VALID)
        
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
                {"detail": "Hanya bisa mereview permohonan dengan status menunggu validasi HR"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PermohonanHRSerializer(permohonan, data=request.data, partial=True)
        if serializer.is_valid():
            # Validasi status
            if request.data.get('status') == 'valid':
                # Jika valid, ubah status ke valid (menunggu pimpinan)
                serializer.save(status=Permohonan.StatusPermohonan.VALID)
            elif request.data.get('status') == 'tidak_valid':
                # Jika tidak valid, simpan dengan status tidak valid
                serializer.save(status=Permohonan.StatusPermohonan.TIDAK_VALID)
            else:
                return Response(
                    {"detail": "Status harus valid atau tidak_valid"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            return Response({
                "success": True,
                "message": "Validasi permohonan berhasil",
                "data": serializer.data
            })
            
        return Response({
            "success": False,
            "message": "Validasi permohonan gagal",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='pimpinan-review')
    def pimpinan_review(self, request, pk=None):
        permohonan = self.get_object()
        
        # Hanya bisa mereview jika status valid (sudah divalidasi HR)
        if permohonan.status != Permohonan.StatusPermohonan.VALID:
            return Response(
                {"detail": "Hanya bisa mereview permohonan yang sudah divalidasi HR"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PermohonanPimpinanSerializer(permohonan, data=request.data, partial=True)
        if serializer.is_valid():
            if request.data.get('status') == 'disetujui':
                serializer.save(status=Permohonan.StatusPermohonan.DISETUJUI)
            elif request.data.get('status') == 'ditolak':
                # Pastikan catatan pimpinan diisi jika ditolak
                if not request.data.get('catatan_pimpinan'):
                    return Response({
                        "success": False,
                        "message": "Review pimpinan gagal",
                        "errors": {
                            "catatan_pimpinan": ["Catatan wajib diisi jika permohonan ditolak."]
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
                serializer.save(status=Permohonan.StatusPermohonan.DITOLAK)
            else:
                return Response(
                    {"detail": "Status harus disetujui atau ditolak"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            return Response({
                "success": True,
                "message": "Review pimpinan berhasil",
                "data": serializer.data
            })
            
        return Response({
            "success": False,
            "message": "Review pimpinan gagal",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
