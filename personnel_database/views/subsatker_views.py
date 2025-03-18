from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from personnel_database.serializers.subsatker_serializer import SubSatKerSerializer
from personnel_database.services.subsatker_service import SubSatKerService

from commons.applibs.response import prepare_success_response, prepare_error_response

class SubSatKerView(APIView) :
    permission_classes = [IsAuthenticated,]
    
    def __init__(self) :
        self.serializer = SubSatKerSerializer

    def get(self, request) :
        subsatker_list = SubSatKerService.get_all_subsatker()
        serializer_data = self.serializer(subsatker_list, many=True).data
        return Response(prepare_success_response(serializer_data), status.HTTP_200_OK)
