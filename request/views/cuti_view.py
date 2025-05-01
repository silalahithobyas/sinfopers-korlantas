from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status  # <-- Tambahkan ini
from utils.api_response import prepare_success_response, prepare_error_response
from request.serializers.cuti_serializer import CutiSerializer
from request.services.cuti_service import CutiService
from django.core.exceptions import ValidationError

class CutiCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Validasi Input
        serializer = CutiSerializer(data=request.data)
        if not serializer.is_valid():
            return prepare_error_response(
                message="Invalid data",
                details=serializer.errors,
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY  # <-- Pakai status dari DRF
            )

        # Proses Bisnis
        try:
            cuti = CutiService.create_cuti(
                user=request.user,
                data=serializer.validated_data
            )
            return prepare_success_response(
                data={"id": cuti.id},
                message="Cuti created successfully",
                status_code=status.HTTP_201_CREATED  # <-- Status code untuk create
            )

        except ValidationError as e:
            return prepare_error_response(
                message=str(e),
                status_code=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            return prepare_error_response(
                message="Internal server error",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )