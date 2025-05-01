from django.db import models
from django.conf import settings
from .base import BaseModel
import enum

class CutiRequest(BaseModel):
    class StatusChoices(str, enum.Enum):
        DIKIRIM = "dikirim"
        DIPERIKSA = "diperiksa"
        APPROVED = "approved"
        REJECTED = "rejected"

        @classmethod
        def choices(cls):
            return [(item.value, item.name) for item in cls]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tanggal_pengajuan = models.DateField(auto_now_add=True)
    tanggal_mulai = models.DateField()
    tanggal_selesai = models.DateField()
    alasan = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices(),
        default=StatusChoices.DIKIRIM.value
    )

    class Meta:
        verbose_name = "Cuti Request"
        verbose_name_plural = "Cuti Requests"
        db_table = "cuti_requests"  # Nama tabel di database

    def __str__(self):
        return f"Cuti {self.user.username} ({self.tanggal_mulai} - {self.tanggal_selesai})"