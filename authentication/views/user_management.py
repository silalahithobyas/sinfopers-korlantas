# Create this file as authentication/views/user_management.py

import logging
from urllib import request

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from commons.applibs.response import prepare_success_response, prepare_error_response, serializer_error_response
from commons.middlewares.exception import APIException
from commons.middlewares.permissions import IsAdmin, IsHR, IsPimpinan
from authentication.serializers.user_serializer import UserSerializer, UserCreateSerializer, ChangePasswordSerializer
from authentication.models.users import AuthUser
from personnel_database.models.users import UserPersonil
from django.db.models import Q
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
        # Cek permission khusus untuk pembuatan user (hanya Admin)
        if not IsAdmin().has_permission(request, self):
            return Response(
                prepare_error_response("Hanya Admin yang bisa membuat user baru."),
                status.HTTP_403_FORBIDDEN
            )
        
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


class UnlinkedUsersView(APIView):
    """
    View untuk mendapatkan daftar user yang belum terhubung dengan personil
    Bisa diakses oleh Admin, HR, dan Pimpinan
    """
    permission_classes = [IsAuthenticated, IsAdmin | IsHR | IsPimpinan]

    def get(self, request):
        """Get users that are not linked to any personnel"""
        try:
            # Filter user yang belum memiliki personil
            # Menggunakan Django's related objects yang belum terhubung (isnull=True)
            users = AuthUser.objects.filter(personil__isnull=True, is_active=True)
            serializer = UserSerializer(users, many=True)
            return Response(prepare_success_response(serializer.data), status.HTTP_200_OK)

        except APIException as e:
            return Response(prepare_error_response(str(e)), e.status_code)

        except Exception as e:
            logger.error(f"Error getting unlinked users: {str(e)}")
            return Response(prepare_error_response(str(e)), status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserIncompleteDataView(APIView):
    """
    Enhanced view to get Pimpinan/Anggota users without personnel data
    with comprehensive debugging
    """
    permission_classes = [IsAuthenticated, IsAdmin | IsHR]

    def get(self, request):
        """Get incomplete users with detailed debugging"""
        try:


            personil_ids = list(UserPersonil.objects.values_list('id', flat=True))
    
            
            # Main query
            users = AuthUser.objects.filter(
                Q(role=AuthUser.PIMPINAN) | Q(role=AuthUser.ANGGOTA)
            ).exclude(
                id__in=personil_ids
            ).order_by('username')

            if users.exists():
                sample_user = users.first()

            # Serialization
            serializer = UserSerializer(users, many=True)

            # Prepare final response
            response_data = {
                "success": True,
                "count": users.count(),
                "results": serializer.data,
                "_debug": {  # Include debug info in response for development
                    "personil_ids_count": len(personil_ids),
                    "sample_user": serializer.data[0] if serializer.data else None
                }
            }
            
            return Response(
                prepare_success_response(response_data),
                status.HTTP_200_OK
            )

        except Exception as e:
            logger.exception("Critical error in UserIncompleteDataView")
            return Response(
                prepare_error_response({
                    "message": "Internal server error",
                    "debug_info": str(e)
                }),
                status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer_error_response(serializer.errors), status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response(prepare_success_response({"message": "Password berhasil diubah."}), status=status.HTTP_200_OK)

