# personnel_database/views/personil_user_link_view.py

import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db import transaction
from django.shortcuts import get_object_or_404

from commons.applibs.response import prepare_success_response, prepare_error_response
from commons.middlewares.exception import APIException, BadRequestException
from commons.middlewares.permissions import IsHR

from authentication.models.users import AuthUser
from personnel_database.models.users import UserPersonil
from personnel_database.serializers.link_personil_serializer import LinkPersonilToUserSerializer

logger = logging.getLogger('general')

class LinkPersonilToUserView(APIView):
    """
    View untuk menghubungkan personil baru dengan user yang sudah ada
    Endpoint ini hanya untuk HR
    """
    permission_classes = [IsAuthenticated, IsHR]
    
    def post(self, request):
        """Buat personil baru dan hubungkan dengan user yang sudah ada"""
        logger.info(f"[DEBUG] Received request to link personil to user: {request.data}")
        
        try:
            # Validasi data
            serializer = LinkPersonilToUserSerializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                
                # Format yang lebih konsisten untuk error validasi
                # Ini akan menghasilkan format yang sama dengan prepare_error_response
                # tapi dengan detail errors yang lebih lengkap
                return Response(
                    {
                        "success": False,
                        "message": "Validasi data gagal",
                        "errors": serializer.errors
                    }, 
                    status.HTTP_400_BAD_REQUEST
                )
            
            # Ambil user_id dari request
            user_id = serializer.validated_data.pop('user_id')
            logger.info(f"[DEBUG] Attempting to link user ID {user_id} to new personil")
            
            # Cek apakah user ada
            try:
                user = get_object_or_404(AuthUser, id=user_id)
                logger.info(f"[DEBUG] Found user: {user.username}")
            except Exception as e:
                logger.error(f"[DEBUG] User not found: {str(e)}")
                raise BadRequestException(f"User dengan ID {user_id} tidak ditemukan")
            
            # Cek apakah user sudah memiliki personil
            if hasattr(user, 'personil') and user.personil:
                logger.error(f"[DEBUG] User {user.username} already has personil")
                raise BadRequestException(f"User {user.username} sudah terhubung dengan personil. Silakan pilih user lain.")
            
            with transaction.atomic():
                # Buat personil baru
                try:
                    # Gunakan service yang sudah ada untuk membuat personil
                    from personnel_database.services.user_personil_service import UserPersonilService
                    
                    logger.info(f"[DEBUG] Creating new personil with data: {serializer.validated_data}")
                    
                    # Pastikan valid_data menyertakan semua field yang diperlukan
                    personil = UserPersonilService.add_personil(**serializer.validated_data)
                    
                    # Hubungkan dengan user
                    personil.user = user
                    personil.save()
                    
                    logger.info(f"[DEBUG] Successfully linked user {user.username} to personil {personil.nama}")
                    
                    # Siapkan data respons
                    from personnel_database.serializers.user_personil_serializer import UserPersonilSerializer
                    response_data = {
                        "personil": UserPersonilSerializer(personil).data,
                        "message": f"Personil berhasil dibuat dan dihubungkan dengan user {user.username}"
                    }
                    
                    return Response(prepare_success_response(response_data), status.HTTP_201_CREATED)
                    
                except Exception as e:
                    logger.error(f"[DEBUG] Error creating personil: {str(e)}")
                    # Format error yang konsisten
                    if hasattr(e, 'detail') and isinstance(e.detail, dict):
                        # Jika exception menyediakan detail validasi
                        return Response({
                            "success": False,
                            "message": f"Gagal membuat personil: {str(e)}",
                            "errors": e.detail
                        }, status.HTTP_400_BAD_REQUEST)
                    else:
                        raise BadRequestException(f"Gagal membuat personil: {str(e)}")
            
        except APIException as e:
            logger.error(f"[DEBUG] API Exception: {str(e)}")
            
            # Format yang konsisten untuk API exceptions
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                return Response({
                    "success": False,
                    "message": str(e),
                    "errors": e.detail
                }, e.status_code)
            else:
                return Response(prepare_error_response(str(e)), e.status_code)
            
        except Exception as e:
            logger.error(f"[DEBUG] Unexpected error linking personil to user: {str(e)}")
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR) 