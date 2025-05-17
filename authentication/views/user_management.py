# Create this file as authentication/views/user_management.py

import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from commons.applibs.response import prepare_success_response, prepare_error_response, serializer_error_response
from commons.middlewares.exception import APIException
from commons.middlewares.permissions import IsAdmin, IsHR
from authentication.serializers.user_serializer import UserSerializer, UserCreateSerializer
from authentication.models.users import AuthUser
from personnel_database.models.users import UserPersonil
from personnel_database.serializers.user_personil_serializer import UserPersonilSerializer

logger = logging.getLogger('general')


class UserManagementView(APIView):
    """
    View for managing users (listing, creating, updating, deleting)
    Only accessible by Admin and HR roles
    """
    permission_classes = [IsAuthenticated, IsAdmin | IsHR]

    def get(self, request):
        """Get all users"""
        try:
            users = AuthUser.objects.all()
            serializer = UserSerializer(users, many=True)
            return Response(prepare_success_response(serializer.data), status.HTTP_200_OK)

        except APIException as e:
            return Response(prepare_error_response(str(e)), e.status_code)

        except Exception as e:
            logger.error(f"Error getting users: {str(e)}")
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create a new user with role"""
        try:
            serializer = UserCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer_error_response(serializer.errors), status.HTTP_400_BAD_REQUEST)

            user = serializer.save()
            return Response(
                prepare_success_response(UserSerializer(user).data),
                status.HTTP_201_CREATED
            )

        except APIException as e:
            return Response(prepare_error_response(str(e)), e.status_code)

        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDetailView(APIView):
    """
    View for managing a specific user (retrieving, updating, deleting)
    Only accessible by Admin and HR roles
    """
    permission_classes = [IsAuthenticated, IsAdmin | IsHR]

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

    def delete(self, request, user_id):
        """Delete a specific user"""
        try:
            user = self.get_user(user_id)
            user.is_active = False
            user.save()
            return Response(
                prepare_success_response({"message": "User deactivated successfully"}),
                status.HTTP_200_OK
            )

        except APIException as e:
            return Response(prepare_error_response(str(e)), e.status_code)

        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDetailWithPersonilView(APIView):
    """
    View for getting detailed information about a user including linked personil data (if any)
    Only accessible by Admin and HR roles
    """
    permission_classes = [IsAuthenticated, IsAdmin | IsHR]

    def get_user(self, user_id):
        try:
            return AuthUser.objects.get(id=user_id)
        except AuthUser.DoesNotExist:
            raise APIException("User not found", status_code=status.HTTP_404_NOT_FOUND)

    def get(self, request, user_id):
        """Get a specific user with personil data (if linked)"""
        try:
            user = self.get_user(user_id)
            user_data = UserSerializer(user).data

            # Try to find linked personil data
            try:
                personil = UserPersonil.objects.get(user=user)
                personil_data = UserPersonilSerializer(personil).data
                has_personil = True
            except UserPersonil.DoesNotExist:
                personil_data = None
                has_personil = False

            # Prepare combined response
            response_data = {
                "user": user_data,
                "has_personil": has_personil,
                "personil": personil_data
            }

            return Response(prepare_success_response(response_data), status.HTTP_200_OK)

        except APIException as e:
            return Response(prepare_error_response(str(e)), e.status_code)

        except Exception as e:
            logger.error(f"Error getting user detail with personil: {str(e)}")
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)