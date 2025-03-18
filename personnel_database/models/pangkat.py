import enum
from django.db import models

from authentication.models.base import BaseModel

class Pangkat(BaseModel) :
    class Tipe(str, enum.Enum) :
        PNS_POLRI = "PNS POLRI"
        POLRI = "POLRI"

        @classmethod
        def choices(cls):
            return [(item.value, item.name) for item in cls]    

    nama = models.CharField(max_length=120, unique=True)
    tipe = models.CharField(max_length=120, choices=Tipe.choices(), default=Tipe.POLRI)

    def __str__(self) :
        return self.nama
    