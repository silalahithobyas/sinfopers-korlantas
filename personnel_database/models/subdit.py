# personnel_database/models/subdit
from django.db import models

from authentication.models.base import BaseModel

class SubDit(BaseModel) :
    nama = models.CharField(max_length=120, unique=True)

    def __str__(self) :
        return self.nama
    