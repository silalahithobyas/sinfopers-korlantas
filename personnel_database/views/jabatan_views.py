from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from personnel_database.serializers.jabatan_serializer import JabatanSerializer
from personnel_database.services.jabatan_service import JabatanService

from commons.applibs.response import prepare_success_response

class JabatanView(APIView) :
    permission_classes = [IsAuthenticated,]
    
    def __init__(self) :
        self.serializer = JabatanSerializer

    def get(self, request) :
        jabatan_list = JabatanService.get_all_jabatan()
        serializer_data = self.serializer(jabatan_list, many=True).data
        return Response(prepare_success_response(serializer_data), status.HTTP_200_OK)
