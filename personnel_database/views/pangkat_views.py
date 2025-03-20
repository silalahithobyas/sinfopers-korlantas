from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from personnel_database.serializers.pangkat_serializer import PangkatSerializer
from personnel_database.services.pangkat_service import PangkatService

from commons.applibs.response import prepare_success_response, prepare_error_response

class PangkatView(APIView) :
    permission_classes = [IsAuthenticated,]
    
    def __init__(self) :
        self.serializer = PangkatSerializer

    def get(self, request) :
        pangkat_list = PangkatService.get_all_pangkat()
        serializer_data = self.serializer(pangkat_list, many=True).data
        return Response(prepare_success_response(serializer_data), status.HTTP_200_OK)
