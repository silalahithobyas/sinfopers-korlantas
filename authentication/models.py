from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    def _create_user(self, username, password=None, **extra_fields):
        """Create and save a User with the given username and password."""
        if not username:
            raise ValueError('The username must be set')
        
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username, password=None, **extra_fields):
        """Create and save a regular User with the given username and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(username, password, **extra_fields)

    def create_superuser(self, username, password=None, **extra_fields):
        """Create and save a SuperUser with the given username and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(username, password, **extra_fields)


class User(AbstractUser):
    """Custom User model"""
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('HR', 'HR'),
        ('Pimpinan', 'Pimpinan'),
        ('Anggota', 'Anggota'),
    ]
    
    full_name = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Anggota')
    email = models.EmailField(blank=True, null=True)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    def __str__(self):
        return self.username