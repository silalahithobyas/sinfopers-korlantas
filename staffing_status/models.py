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
    rill = models.IntegerField(
        default=0, 
        verbose_name="Riil",
        help_text="Jumlah personel aktual yang saat ini mengisi posisi ini"
    )

    def __str__(self) :
        return f"{self.nama} - {self.subsatker.nama}"
        
    class Meta:
        verbose_name = "Status Kepegawaian"
        verbose_name_plural = "Status Kepegawaian"