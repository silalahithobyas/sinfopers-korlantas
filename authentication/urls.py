from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from authentication.views.user_view import UserLogin


urlpatterns = [
    path('login/', UserLogin.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
]
