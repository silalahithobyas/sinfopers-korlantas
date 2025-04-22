# personnel_database/models/subsatker
from django.db import models

from authentication.models.base import BaseModel

class SubSatKer(BaseModel) :
    nama = models.CharField(max_length=120, unique=True)

    def __str__(self) :
        return self.nama
    