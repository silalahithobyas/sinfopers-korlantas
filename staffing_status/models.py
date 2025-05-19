# staffing_status/models.py
from django.db import models
from personnel_database.models.subsatker import SubSatKer
from personnel_database.models.pangkat import Pangkat

class StaffingStatus(models.Model) :
    nama = models.CharField(max_length=120)
    subsatker = models.ForeignKey(SubSatKer, on_delete=models.CASCADE)
    pangkat = models.ManyToManyField(Pangkat)
    dsp = models.IntegerField(
        default=0, 
        verbose_name="DSP",
        help_text="Daftar Susunan Personel - Jumlah personel yang seharusnya mengisi posisi ini"
    )

    def __str__(self) :
        return f"{self.nama} - {self.subsatker.nama}"
    
    @property
    def rill(self):
        """
        Hitung jumlah personil aktif dengan kombinasi pangkat dan subsatker ini
        """
        # Import di sini untuk menghindari circular import
        from personnel_database.models.users import UserPersonil
        
        # Gunakan semua pangkat dari relasi many-to-many
        pangkat_ids = self.pangkat.values_list('id', flat=True)
        
        # Hitung jumlah personil yang terkait
        count = UserPersonil.objects.filter(
            pangkat_id__in=pangkat_ids,
            subsatker_id=self.subsatker_id,
            status="Aktif"  # Hanya hitung personil aktif
        ).count()
        
        return count
    
    def is_full(self):
        """
        Cek apakah jumlah personil sudah mencapai atau melebihi DSP
        """
        return self.rill >= self.dsp
        
    class Meta:
        verbose_name = "Status Kepegawaian"
        verbose_name_plural = "Status Kepegawaian"