import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from commons.applibs.response import prepare_success_response, prepare_error_response, serializer_error_response
from commons.middlewares.exception import APIException
from authentication.serializers.user_serializer import LoginSerializer

logger = logging.getLogger('general')

class UserLogin(APIView):
    def __init__(self):
        super(UserLogin, self).__init__()

        self.login_serializer = LoginSerializer

    def post(self, request):
        try :
            login_serializer = self.login_serializer(data=request.data)
            if not login_serializer.is_valid():
                return Response(serializer_error_response(login_serializer.errors),
                                status.HTTP_400_BAD_REQUEST)
                
            serializer_data = login_serializer.validated_data
            return Response(prepare_success_response(serializer_data), status.HTTP_200_OK)
        
        except APIException as e :
            return Response(prepare_error_response(str(e)), e.status_code)
        
        except Exception as e :
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)
