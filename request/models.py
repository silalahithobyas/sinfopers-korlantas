from django.db import models
from django.contrib.auth.models import User  # asumsi pakai default User
from django.conf import settings

class CutiRequest(models.Model):
    requestId = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tanggalMulai = models.DateField()
    tanggalSelesai = models.DateField()
    alasan = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('dikirim', 'Dikirim'),
        ('diperiksa', 'Diperiksa'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='dikirim')

    def __str__(self):
        return f"Cuti {self.user.username} dari {self.tanggalMulai} sampai {self.tanggalSelesai}"

class MutasiRequest(models.Model):
    requestId = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    alamatBaru = models.TextField()
    tanggalPengajuan = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('dikirim', 'Dikirim'),
        ('diperiksa', 'Diperiksa'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='dikirim')

    def __str__(self):
        return f"Mutasi {self.user.username} ke {self.alamatBaru}"
