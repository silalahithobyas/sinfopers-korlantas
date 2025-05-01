from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ..serializers.mutasi_serializer import MutasiSerializer
from ..services.mutasi_service import MutasiService
from utils.api_response import prepare_success_response, prepare_error_response

class MutasiCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MutasiSerializer(data=request.data)
        if not serializer.is_valid():
            return prepare_error_response(
                message="Invalid data",
                details=serializer.errors,
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        mutasi = MutasiService.create_mutasi(
            user=request.user,
            validated_data=serializer.validated_data
        )
        return prepare_success_response(
            data={"id": mutasi.id},
            message="Mutasi created successfully",
            status_code=status.HTTP_201_CREATED
        )