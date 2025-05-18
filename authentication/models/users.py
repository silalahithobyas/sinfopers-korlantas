# authentication/models/users.py

import uuid
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, password, username, **kwargs):
        return self.create(username=username,
                           password=make_password(password),
                           **kwargs)

    def create_superuser(self, username, password):
        """
        Create and return a `User` with superuser (admin) permissions.
        """
        if password is None:
            raise TypeError('Superusers must have a password.')

        user = self.create_user(
            username=username,
            password=password,
            role='admin'
        )
        user.is_superuser = True
        user.is_staff = True
        user.save()

        return user

    def get_user_by_username(self, username):
        return self.filter(username=username, is_active=True).last()

    def reset_password(self, username, password):
        user = self.get_user_by_username(username)
        user.password = make_password(password)
        user.save()


class AuthUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(_('email address'), null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Add role field
    ADMIN = 'admin'
    HR = 'hr'
    PIMPINAN = 'pimpinan'
    ANGGOTA = 'anggota'

    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (HR, 'HR'),
        (PIMPINAN, 'Pimpinan'),
        (ANGGOTA, 'Anggota'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ANGGOTA,
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.username}"

    def get_full_name(self):
        """
        Method ini mengembalikan username sebagai nama lengkap.
        Di masa depan bisa dimodifikasi jika ada field nama lengkap.
        """
        return self.username

    @property
    def is_admin(self):
        return self.is_staff or self.role == self.ADMIN

    @property
    def is_hr(self):
        return self.role == self.HR

    @property
    def is_pimpinan(self):
        return self.role == self.PIMPINAN

    @property
    def is_anggota(self):
        return self.role == self.ANGGOTA