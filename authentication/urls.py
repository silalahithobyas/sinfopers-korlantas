# Update authentication/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from authentication.views.user_view import UserLogin
from authentication.views.user_management import UserManagementView, UserDetailView, ChangePasswordView, UserIncompleteDataView

urlpatterns = [
    path('login/', UserLogin.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),

    # User management endpoints
    path('users/', UserManagementView.as_view()),
    path('users/<uuid:user_id>/', UserDetailView.as_view()),
    path('users/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/incomplete/', UserIncompleteDataView.as_view()),
]