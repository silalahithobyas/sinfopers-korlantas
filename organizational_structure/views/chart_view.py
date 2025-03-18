from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from commons.middlewares.exception import APIException
from commons.applibs.response import prepare_error_response, prepare_success_response, serializer_error_response

from organizational_structure.serializer import ChartNameSerializer, ChartSerializer, CreateChartSerializer
from organizational_structure.service import OrganizationalStructureService

class ChartView(APIView) :
    permission_classes = [IsAuthenticated,]

    def __init__(self) :
        self.create_serializer = CreateChartSerializer
        self.serializer = ChartSerializer
        self.service = OrganizationalStructureService
        self.chart_name_serializer = ChartNameSerializer

    def post(self, request) :
        try :
            serializer = self.create_serializer(data=request.data)
            if(not serializer.is_valid()) :
                return Response(serializer_error_response(serializer.errors), status.HTTP_400_BAD_REQUEST)
            chart = self.service.create_chart(**serializer.data)
            serializer_data = self.serializer(chart).data
            return Response(prepare_success_response(serializer_data), status.HTTP_201_CREATED)
        except APIException as e :
            return Response(prepare_error_response(str(e)), e.status_code)
        except Exception as e :
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)
