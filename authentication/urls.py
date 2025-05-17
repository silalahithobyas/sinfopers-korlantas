# Update authentication/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from authentication.views.user_view import UserLogin
from authentication.views.user_management import UserManagementView, UserDetailView, UserDetailWithPersonilView, UnlinkedUsersView
from authentication.views.user_personil_management import UserPersonilManagementView

urlpatterns = [
    path('login/', UserLogin.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),

    # User management endpoints
    path('users/', UserManagementView.as_view()),
    path('users/<uuid:user_id>/', UserDetailView.as_view()),
    
    # User detail with personil endpoint
    path('users/<uuid:user_id>/with-personil/', UserDetailWithPersonilView.as_view()),
    
    # Get users without personil
    path('users/unlinked/', UnlinkedUsersView.as_view()),
    
    # User-Personil combined endpoint
    path('users-personil/', UserPersonilManagementView.as_view()),
]