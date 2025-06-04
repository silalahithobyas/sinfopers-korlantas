import uuid
import os
from django.db import models
from django.core.exceptions import ValidationError
from authentication.models import AuthUser
from commons.models import BaseModel

def validate_file_extension(value):
    if not value:
        return
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.pdf']
    if not ext.lower() in valid_extensions:
        raise ValidationError('File harus berformat PDF.')

class SaldoCuti(models.Model):
    personel = models.ForeignKey(AuthUser, on_delete=models.CASCADE, related_name='saldo_cuti')
    tahun = models.PositiveIntegerField()
    hak_cuti = models.PositiveIntegerField(default=12)  # Hak cuti per tahun
    cuti_diambil = models.PositiveIntegerField(default=0)
    sisa_bawa_tahun_lalu = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('personel', 'tahun')
        ordering = ['-tahun']

    @property
    def sisa_cuti(self):
        return self.hak_cuti + self.sisa_bawa_tahun_lalu - self.cuti_diambil

    def __str__(self):
        return f"{self.personel.username} - Tahun {self.tahun} - Sisa cuti: {self.sisa_cuti}"

    @classmethod
    def get_or_create_for_year(cls, personel, tahun):
        saldo, created = cls.objects.get_or_create(personel=personel, tahun=tahun)
        if created:
            # Ambil sisa cuti tahun lalu maksimal 12 hari
            saldo_lalu = cls.objects.filter(personel=personel, tahun=tahun-1).first()
            if saldo_lalu:
                saldo.sisa_bawa_tahun_lalu = min(12, saldo_lalu.sisa_cuti)
                saldo.save()
        return saldo

    def update_cuti_diambil(self, jumlah_hari):
        self.cuti_diambil += jumlah_hari
        if self.cuti_diambil > self.hak_cuti + self.sisa_bawa_tahun_lalu:
            raise ValidationError("Jumlah cuti diambil melebihi hak cuti dan sisa bawa tahun lalu.")
        self.save()

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

    tanggal_mulai = models.DateField(null=True, blank=True)
    tanggal_selesai = models.DateField(null=True, blank=True)
    jumlah_hari = models.PositiveIntegerField(null=True, blank=True)

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()

        if self.jenis_permohonan == self.JenisPermohonan.CUTI:
            if not self.tanggal_mulai or not self.tanggal_selesai:
                raise ValidationError("Tanggal mulai dan tanggal selesai wajib diisi untuk permohonan cuti.")

            if self.tanggal_mulai > self.tanggal_selesai:
                raise ValidationError("Tanggal mulai tidak boleh lebih besar dari tanggal selesai.")

            self.jumlah_hari = (self.tanggal_selesai - self.tanggal_mulai).days + 1

            tahun_cuti = self.tanggal_mulai.year
            saldo = SaldoCuti.get_or_create_for_year(self.personel, tahun_cuti)

            # Periksa apakah permohonan melebihi sisa cuti
            if self.jumlah_hari > saldo.sisa_cuti:
                raise ValidationError(f"Pengajuan cuti melebihi sisa hak cuti tahunan ({saldo.sisa_cuti} hari).")

    def save(self, *args, **kwargs):
        if self.jenis_permohonan == self.JenisPermohonan.CUTI and self.tanggal_mulai and self.tanggal_selesai:
            self.jumlah_hari = (self.tanggal_selesai - self.tanggal_mulai).days + 1
        super().save(*args, **kwargs)

    alasan = models.TextField()
    file_pendukung = models.FileField(
        upload_to='permohonan/', 
        validators=[validate_file_extension],
        null=True, 
        blank=True,
        help_text="Wajib mengunggah file PDF sebagai lampiran pendukung"
    )
    status = models.CharField(
        max_length=50,
        choices=StatusPermohonan.choices,
        default=StatusPermohonan.PENDING_HR
    )
    # Data reviewer HR
    hr_reviewer = models.ForeignKey(
        AuthUser, 
        on_delete=models.SET_NULL, 
        related_name='hr_validasi', 
        null=True, 
        blank=True
    )
    hr_review_date = models.DateTimeField(null=True, blank=True)
    catatan_hr = models.TextField(blank=True, null=True)
    
    # Data reviewer Pimpinan
    pimpinan_reviewer = models.ForeignKey(
        AuthUser, 
        on_delete=models.SET_NULL, 
        related_name='pimpinan_persetujuan', 
        null=True, 
        blank=True
    )
    pimpinan_review_date = models.DateTimeField(null=True, blank=True)
    catatan_pimpinan = models.TextField(blank=True, null=True)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.personel.username} - {self.jenis_permohonan} - {self.status}"

    class Meta:
        ordering = ['-date_created']
        verbose_name = "Permohonan"
        verbose_name_plural = "Permohonan"
