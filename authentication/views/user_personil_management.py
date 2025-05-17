import logging
from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from authentication.permissions import IsAdminOrHR
from authentication.serializers.user_personil_serializer import UserPersonilCreateSerializer
from commons.applibs.response import prepare_success_response, prepare_error_response, serializer_error_response
from commons.middlewares.exception import APIException

logger = logging.getLogger('general')

class UserPersonilManagementView(APIView):
    """
    Endpoint untuk mengelola user dan personil secara bersamaan
    """
    permission_classes = [IsAuthenticated, IsAdminOrHR]
    
    def post(self, request):
        """
        Buat user dan personil secara bersamaan
        """
        try:
            serializer = UserPersonilCreateSerializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                # Format error yang konsisten untuk frontend
                error_response = {
                    "success": False,
                    "errors": serializer.errors,
                    "message": "Validasi data gagal"
                }
                return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                result = serializer.save()
                return Response(
                    prepare_success_response(result),
                    status.HTTP_201_CREATED
                )
            except serializers.ValidationError as validation_error:
                logger.error(f"Validation error during save: {validation_error}")
                
                # Format error yang konsisten
                error_data = validation_error.detail if hasattr(validation_error, 'detail') else {"detail": str(validation_error)}
                
                # Siapkan format error yang mudah diproses frontend
                error_response = {
                    "success": False,
                    "errors": error_data,
                    "message": "Validasi gagal saat menyimpan data"
                }
                
                return Response(error_response, status.HTTP_400_BAD_REQUEST)
            
        except APIException as e:
            logger.error(f"API Exception: {str(e)}")
            error_response = {
                "success": False,
                "errors": {"detail": str(e)},
                "message": "Terjadi kesalahan API"
            }
            return Response(error_response, e.status_code)
            
        except Exception as e:
            logger.error(f"Error creating user and personil: {str(e)}", exc_info=True)
            error_response = {
                "success": False,
                "errors": {"detail": str(e)},
                "message": "Terjadi kesalahan tidak terduga"
            }
            return Response(error_response, status.HTTP_500_INTERNAL_SERVER_ERROR) 