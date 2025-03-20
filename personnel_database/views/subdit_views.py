from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from personnel_database.serializers.subdit_serializer import SubditSerializer
from personnel_database.services.subdit_service import SubditService

from commons.applibs.response import prepare_success_response, prepare_error_response

class SubditView(APIView) :
    permission_classes = [IsAuthenticated,]
    
    def __init__(self) :
        self.serializer = SubditSerializer

    def get(self, request) :
        subdit_list = SubditService.get_all_subdit()
        serializer_data = self.serializer(subdit_list, many=True).data
        return Response(prepare_success_response(serializer_data), status.HTTP_200_OK)
