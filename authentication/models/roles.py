# authentication/models/roles.py

import uuid
from django.db import models
from authentication.models.base import BaseModel


class Role(BaseModel):
    """
    Role model for handling different user roles in the system.
    """
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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.get_name_display()