from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Permohonan
from .serializers import PermohonanSerializer, PermohonanHRSerializer, PermohonanPimpinanSerializer
from authentication.models import AuthUser
from django.utils import timezone
import logging
import traceback
from rest_framework.parsers import MultiPartParser, FormParser

# Tambahkan logger untuk mempermudah debugging
logger = logging.getLogger(__name__)

class IsHR(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == AuthUser.HR

class IsPimpinan(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == AuthUser.PIMPINAN

class PermohonanViewSet(viewsets.ModelViewSet):
    serializer_class = PermohonanSerializer
    parser_classes = [MultiPartParser, FormParser]
    
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
        elif self.action == 'history_hr':
            # Hanya HR yang bisa mengakses history HR
            return [IsHR()]
        elif self.action == 'history_pimpinan':
            # Hanya pimpinan yang bisa mengakses history pimpinan
            return [IsPimpinan()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(personel=self.request.user)

    def perform_update(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['post'], url_path='hr-review')
    def hr_review(self, request, pk=None):
        """
        Endpoint untuk HR melakukan review terhadap permohonan
        """
        try:
            permohonan = self.get_object()
            logger.info(f"HR Review untuk permohonan {pk} oleh {request.user.username}")
            
            # Hanya bisa mereview jika status pending_hr
            if permohonan.status != Permohonan.StatusPermohonan.PENDING_HR:
                return Response(
                    {"detail": "Hanya bisa mereview permohonan dengan status menunggu validasi HR"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Logging data request untuk debugging
            logger.info(f"Request data: {request.data}")
            
            # Proses langsung tanpa serializer validation yang menyebabkan error
            req_status = request.data.get('status')
            catatan_hr = request.data.get('catatan_hr', '')
            
            logger.info(f"Status permohonan: {req_status}")
            
            if req_status == 'valid':
                # Jika valid, ubah status ke valid (menunggu pimpinan)
                permohonan.status = Permohonan.StatusPermohonan.VALID
                permohonan.hr_reviewer = request.user
                permohonan.hr_review_date = timezone.now()
                permohonan.catatan_hr = catatan_hr
                permohonan.save()
                
                logger.info(f"Permohonan {pk} divalidasi oleh HR {request.user.username}")
                
            elif req_status == 'tidak_valid':
                # Jika tidak valid, simpan dengan status tidak valid
                if not catatan_hr:
                    return Response(
                        {"detail": "Catatan HR wajib diisi jika status Tidak Valid"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                permohonan.status = Permohonan.StatusPermohonan.TIDAK_VALID
                permohonan.hr_reviewer = request.user
                permohonan.hr_review_date = timezone.now()
                permohonan.catatan_hr = catatan_hr
                permohonan.save()
                
                logger.info(f"Permohonan {pk} ditolak oleh HR {request.user.username}")
                
            else:
                return Response(
                    {"detail": "Status harus valid atau tidak_valid"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Gunakan serializer hanya untuk output (tanpa validasi)
            serializer = PermohonanSerializer(permohonan)
            return Response({
                "success": True,
                "message": "Validasi permohonan berhasil",
                "data": serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error in hr_review: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                "success": False,
                "message": f"Terjadi kesalahan dalam memproses review: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='pimpinan-review')
    def pimpinan_review(self, request, pk=None):
        """
        Endpoint untuk Pimpinan mereview permohonan
        """
        try:
            permohonan = self.get_object()
            logger.info(f"Pimpinan Review untuk permohonan {pk} oleh {request.user.username}")
            
            # Hanya bisa mereview jika status valid (sudah divalidasi HR)
            if permohonan.status != Permohonan.StatusPermohonan.VALID:
                return Response(
                    {"detail": "Hanya bisa mereview permohonan yang sudah divalidasi HR"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Logging data request untuk debugging
            logger.info(f"Request data: {request.data}")
            
            # Proses langsung tanpa serializer validation yang menyebabkan error
            req_status = request.data.get('status')
            catatan_pimpinan = request.data.get('catatan_pimpinan', '')
            
            if req_status == 'disetujui':
                permohonan.status = Permohonan.StatusPermohonan.DISETUJUI
                permohonan.pimpinan_reviewer = request.user
                permohonan.pimpinan_review_date = timezone.now()
                permohonan.catatan_pimpinan = catatan_pimpinan
                permohonan.save()
                
                logger.info(f"Permohonan {pk} disetujui oleh Pimpinan {request.user.username}")
                
            elif req_status == 'ditolak':
                # Pastikan catatan pimpinan diisi jika ditolak
                if not catatan_pimpinan:
                    return Response({
                        "success": False,
                        "message": "Review pimpinan gagal",
                        "errors": {
                            "catatan_pimpinan": ["Catatan wajib diisi jika permohonan ditolak."]
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                permohonan.status = Permohonan.StatusPermohonan.DITOLAK
                permohonan.pimpinan_reviewer = request.user
                permohonan.pimpinan_review_date = timezone.now()
                permohonan.catatan_pimpinan = catatan_pimpinan
                permohonan.save()
                
                logger.info(f"Permohonan {pk} ditolak oleh Pimpinan {request.user.username}")
                
            else:
                return Response(
                    {"detail": "Status harus disetujui atau ditolak"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Gunakan serializer hanya untuk output (tanpa validasi)
            serializer = PermohonanSerializer(permohonan)
            return Response({
                "success": True,
                "message": "Review pimpinan berhasil",
                "data": serializer.data
            })
            
        except Exception as e:
            logger.error(f"Error in pimpinan_review: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                "success": False,
                "message": f"Terjadi kesalahan dalam memproses review: {str(e)}",
                "data": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='history/hr')
    def history_hr(self, request):
        """
        Endpoint untuk HR melihat history permohonan yang sudah divalidasi
        """
        try:
            # Validasi bahwa user adalah HR
            if request.user.role != AuthUser.HR:
                return Response(
                    {"detail": "Hanya HR yang dapat mengakses endpoint ini"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Ambil permohonan yang sudah diproses oleh HR (valid atau tidak_valid)
            queryset = Permohonan.objects.filter(
                status__in=[
                    Permohonan.StatusPermohonan.VALID, 
                    Permohonan.StatusPermohonan.TIDAK_VALID,
                    Permohonan.StatusPermohonan.DISETUJUI,
                    Permohonan.StatusPermohonan.DITOLAK
                ]
            ).order_by('-date_updated')
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in history_hr: {str(e)}")
            return Response(
                {"detail": f"Terjadi kesalahan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='history/pimpinan')
    def history_pimpinan(self, request):
        """
        Endpoint untuk Pimpinan melihat history permohonan yang sudah disetujui/ditolak
        """
        try:
            # Validasi bahwa user adalah Pimpinan
            if request.user.role != AuthUser.PIMPINAN:
                return Response(
                    {"detail": "Hanya Pimpinan yang dapat mengakses endpoint ini"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Ambil permohonan yang sudah diproses oleh Pimpinan (disetujui atau ditolak)
            queryset = Permohonan.objects.filter(
                status__in=[
                    Permohonan.StatusPermohonan.DISETUJUI,
                    Permohonan.StatusPermohonan.DITOLAK
                ]
            ).order_by('-date_updated')
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in history_pimpinan: {str(e)}")
            return Response(
                {"detail": f"Terjadi kesalahan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
