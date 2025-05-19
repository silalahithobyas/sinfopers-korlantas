from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging

from personnel_database.serializers.subsatker_serializer import SubSatKerSerializer
from personnel_database.services.subsatker_service import SubSatKerService

from commons.applibs.response import prepare_success_response, prepare_error_response

logger = logging.getLogger('general')

class SubSatKerView(APIView) :
    # Sementara izinkan akses tanpa autentikasi untuk debugging
    permission_classes = [AllowAny,]
    
    def __init__(self) :
        self.serializer = SubSatKerSerializer

    def get(self, request) :
        try:
            logger.info("Mengambil data subsatker")
            subsatker_list = SubSatKerService.get_all_subsatker()
            serializer_data = self.serializer(subsatker_list, many=True).data
            logger.info(f"Berhasil mengambil {len(serializer_data)} data subsatker")
            return Response(prepare_success_response(serializer_data), status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error mengambil data subsatker: {str(e)}")
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)
