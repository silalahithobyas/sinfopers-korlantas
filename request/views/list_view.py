from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ..services.request_service import RequestService
from utils.api_response import prepare_success_response, prepare_error_response

class RequestListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            requests = RequestService.get_combined_requests(request.user)
            return prepare_success_response(
                data={"requests": requests},
                message="Data permohonan berhasil diambil"
            )
        except Exception as e:
            return prepare_error_response(
                message="Gagal mengambil data permohonan",
                details=str(e),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )