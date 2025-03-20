from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from authentication.models.custom_users import user_model
from authentication.models.users import AuthUser

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user_data = dict(username=username, password=password)

        user = user_model.authenticate(**user_data)

        if not user:
            raise serializers.ValidationError(
                {"username and password": 'username and password is not match.'})
        token = RefreshToken.for_user(user)
        update_last_login(None, user)
        response_data = {
            'token': str(token.access_token),
            'refresh_token': str(token),
        }

        return response_data
