from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from commons.applibs.response import prepare_success_response, prepare_error_response, serializer_error_response
from commons.middlewares.exception import APIException

from staffing_status.services.staffing_service import StaffingService
from staffing_status.serializer import StaffingStatusRequestSerializer

class StaffingStatusView(APIView) :
    permission_classes = [IsAuthenticated,]
    
    def __init__(self) :
        self.serializer = StaffingStatusRequestSerializer 
        self.service = StaffingService

    def get(self, request) :
        data = StaffingService.get_staffing_status()
        return Response(prepare_success_response(data), status.HTTP_200_OK)

    def post(self, request) :
        try :
            serializer = self.serializer(data=request.data)
            if(not serializer.is_valid()) :
                return Response(serializer_error_response(serializer.errors), status.HTTP_400_BAD_REQUEST)
            data = self.service.update_staffing_status(**serializer.data)
            return Response(prepare_success_response(data), status.HTTP_200_OK)
        except APIException as e :
            return Response(prepare_error_response(str(e)), e.status_code)
        except Exception as e :
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR) 
        
class StaffingStatusPangkatView(APIView) :
    permission_classes = [IsAuthenticated,]

    def __init__(self) :
        self.service = StaffingService

    def get(self, request) :
        data = StaffingService.get_total_by_pangkat()
        return Response(prepare_success_response(data), status.HTTP_200_OK)
        
class StaffingStatusExport(APIView) :
    permission_classes = [IsAuthenticated, ]

    def __init__(self) :
        self.service = StaffingService

    def get(self, request) :
        return self.service.export_csv_file()


