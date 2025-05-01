import uuid
from django.db import models
from authentication.models import AuthUser
from commons.models import BaseModel

class Permohonan(BaseModel):
    class JenisPermohonan(models.TextChoices):
        CUTI = 'Cuti', 'Cuti'
        MUTASI = 'Mutasi', 'Mutasi'

    class StatusPermohonan(models.TextChoices):
        PENDING_HR = 'pending_hr', 'Menunggu Validasi HR'
        VALID = 'valid', 'Valid - Menunggu Persetujuan Pimpinan'
        TIDAK_VALID = 'tidak_valid', 'Tidak Valid - Dikembalikan ke Personel'
        DISETUJUI = 'disetujui', 'Disetujui'
        DITOLAK = 'ditolak', 'Ditolak'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    personel = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='permohonan')
    jenis_permohonan = models.CharField(
        max_length=50,
        choices=JenisPermohonan.choices,
        default=JenisPermohonan.CUTI
    )
    alasan = models.TextField()
    file_pendukung = models.FileField(upload_to='permohonan/', null=True, blank=True)
    status = models.CharField(
        max_length=50,
        choices=StatusPermohonan.choices,
        default=StatusPermohonan.PENDING_HR
    )
    catatan_hr = models.TextField(blank=True, null=True)
    catatan_pimpinan = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.personel.username} - {self.jenis_permohonan} - {self.status}"

    class Meta:
        ordering = ['-date_created']
        verbose_name = "Permohonan"
        verbose_name_plural = "Permohonan"
