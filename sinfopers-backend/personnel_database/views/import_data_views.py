from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from commons.applibs.response import prepare_success_response, prepare_error_response, serializer_error_response
from commons.middlewares.exception import APIException

from personnel_database.services.import_data_service import ImportDataService
from personnel_database.serializers.import_data_serializer import ImportDataSerializer
from authentication.models import AuthUser


class ImportDataView(APIView) :
    permission_classes = [IsAuthenticated,]

    def __init__(self) :
        self.service = ImportDataService
        self.serializer = ImportDataSerializer

    def post(self, request) :
        # Hanya Admin dan HR yang dapat mengakses fitur import
        if not (request.user.is_superuser or request.user.role == AuthUser.HR):
            return Response(
                prepare_error_response("Anda tidak memiliki izin untuk mengakses fitur ini"),
                status.HTTP_403_FORBIDDEN
            )
        
        jenis = request.query_params.get('type', None)
        try :
            serializer = self.serializer(data=request.data)
            if(not serializer.is_valid()) :
                return Response(serializer_error_response(serializer.errors), status.HTTP_400_BAD_REQUEST)
            
            response = self.service.import_data(serializer.validated_data['file'], jenis)
            
            # Jika respons berupa dict (untuk import personil)
            if isinstance(response, dict):
                result_data = {
                    "message": f"Import data {jenis} selesai",
                    "total": response["total"],
                    "success": response["success"],
                    "failed": response["failed"],
                    "errors": response["errors"]
                }
                return Response(prepare_success_response(result_data), status.HTTP_201_CREATED)
            
            # Untuk jenis import lainnya
            return Response(prepare_success_response(response), status.HTTP_201_CREATED)
        
        except APIException as e :
            return Response(prepare_error_response(str(e)), e.status_code)
        
        except Exception as e :
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)

