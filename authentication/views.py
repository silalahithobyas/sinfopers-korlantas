from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    AdminPasswordChangeSerializer
)
from .permissions import IsAdminUser

User = get_user_model()


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update', 'change_password', 'list']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_my_password(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'detail': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def change_password(self, request):
        serializer = AdminPasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(id=serializer.validated_data['user_id'])
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response({'detail': f'Password changed for user {user.username}'})
            except User.DoesNotExist:
                return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)