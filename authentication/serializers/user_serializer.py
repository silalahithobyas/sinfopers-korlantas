# Update authentication/serializers/user_serializer.py

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
            'username': user.username,
            'role': user.role,
            'is_staff': user.is_staff,
        }

        return response_data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ('id', 'username', 'email', 'role', 'is_active')
        read_only_fields = ('id',)


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = AuthUser
        fields = ('id', 'username', 'email', 'password', 'role', 'is_active')
        read_only_fields = ('id',)

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = AuthUser.objects.create_user(
            password=password,
            **validated_data
        )
        return user