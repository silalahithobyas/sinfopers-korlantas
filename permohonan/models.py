import uuid
import os
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from authentication.models import AuthUser
from commons.models import BaseModel

def validate_file_extension(value):
    if not value:
        return
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.pdf']
    if not ext.lower() in valid_extensions:
        raise ValidationError('File harus berformat PDF.')

class PermohonanManager(models.Manager):
    """
    Custom manager untuk Permohonan yang otomatis mengecek dan mengupdate
    permohonan yang sudah kadaluarsa
    """
    
    def get_pending_hr(self):
        """
        Get permohonan yang masih pending HR (dengan auto-expire check)
        """
        # Jalankan auto-expire sebelum query
        self.model.auto_expire_pending_requests()
        return self.filter(status=self.model.StatusPermohonan.PENDING_HR)
    
    def get_expired_today(self):
        """
        Get permohonan yang expire hari ini
        """
        cutoff_date = timezone.now() - timedelta(days=7)
        today_start = cutoff_date.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = cutoff_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        return self.filter(
            status=self.model.StatusPermohonan.TIDAK_VALID,
            catatan_hr="Tidak ada persetujuan dari HR, silakan buat permohonan kembali",
            date_updated__range=[today_start, today_end]
        )

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

    # Gunakan custom manager
    objects = PermohonanManager()

    def __str__(self):
        return f"{self.personel.username} - {self.jenis_permohonan} - {self.status}"

    @classmethod
    def auto_expire_pending_requests(cls):
        """
        Otomatis mengubah status permohonan yang sudah lebih dari 7 hari 
        tanpa respon HR menjadi TIDAK_VALID
        """
        import logging
        from django.db import connection
        
        logger = logging.getLogger(__name__)
        
        # Cari permohonan yang masih pending HR dan sudah lebih dari 7 hari
        cutoff_date = timezone.now() - timedelta(days=7)
        
        # Gunakan raw SQL untuk menghindari infinite recursion
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE permohonan_permohonan 
                SET status = %s, 
                    catatan_hr = %s, 
                    date_updated = %s
                WHERE status = %s 
                AND date_created <= %s
            """, [
                cls.StatusPermohonan.TIDAK_VALID,
                "Tidak ada persetujuan dari HR, silakan buat permohonan kembali",
                timezone.now(),
                cls.StatusPermohonan.PENDING_HR,
                cutoff_date
            ])
            
            affected_rows = cursor.rowcount
            
            if affected_rows > 0:
                logger.info(f"Auto-expired {affected_rows} pending requests to TIDAK_VALID status")
            
            return affected_rows

    def is_expired(self):
        """
        Mengecek apakah permohonan sudah kadaluarsa (lebih dari 7 hari tanpa respon HR)
        """
        if self.status != self.StatusPermohonan.PENDING_HR:
            return False
        
        cutoff_date = timezone.now() - timedelta(days=7)
        return self.date_created <= cutoff_date

    class Meta:
        ordering = ['-date_created']
        verbose_name = "Permohonan"
        verbose_name_plural = "Permohonan"
