import logging
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from commons.applibs.response import prepare_success_response, prepare_error_response
from authentication.models.users import AuthUser
from personnel_database.models.users import UserPersonil
from django.db.models import Q
from django.db import connection
from authentication.serializers.user_serializer import UserSerializer, UserCreateSerializer, ChangePasswordSerializer
from authentication.models.users import AuthUser
from commons.applibs.response import prepare_success_response, prepare_error_response, serializer_error_response
from commons.middlewares.exception import APIException
logger = logging.getLogger('general')

class IncompleteAnggotaPimpinanUsersView(APIView):
    """
    Debugging view untuk masalah 500 error
    """
    permission_classes = [IsAuthenticated]


    def get_user(self, user_id):
        try:
            return AuthUser.objects.get(id=user_id)
        except AuthUser.DoesNotExist:
            raise APIException("User not found", status_code=status.HTTP_404_NOT_FOUND)

    def get(self, request, user_id):
        """Get a specific user"""
        try:
            user = self.get_user(user_id)
            serializer = UserSerializer(user)
            return Response(prepare_success_response(serializer.data), status.HTTP_200_OK)

        except APIException as e:
            return Response(prepare_error_response(str(e)), e.status_code)

        except Exception as e:
            logger.error(f"Error getting user: {str(e)}")
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, user_id):
        """Update a specific user"""
        try:
            user = self.get_user(user_id)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if not serializer.is_valid():
                return Response(serializer_error_response(serializer.errors), status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response(prepare_success_response(serializer.data), status.HTTP_200_OK)

        except APIException as e:
            return Response(prepare_error_response(str(e)), e.status_code)

        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)