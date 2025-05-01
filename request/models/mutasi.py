from django.db import models
from django.conf import settings
from .base import BaseModel
import enum

class MutasiRequest(BaseModel):
    class StatusChoices(str, enum.Enum):
        DIKIRIM = "dikirim"
        DIPERIKSA = "diperiksa"
        APPROVED = "approved"
        REJECTED = "rejected"

        @classmethod
        def choices(cls):
            return [(item.value, item.name) for item in cls]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    alamat_baru = models.TextField()
    tanggal_pengajuan = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices(),
        default=StatusChoices.DIKIRIM.value
    )

    class Meta:
        verbose_name = "Mutasi Request"
        verbose_name_plural = "Mutasi Requests"
        db_table = "mutasi_requests"

    def __str__(self):
        return f"Mutasi {self.user.username} ke {self.alamat_baru}"