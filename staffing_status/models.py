from django.db import models
from personnel_database.models.subsatker import SubSatKer
from personnel_database.models.pangkat import Pangkat

class StaffingStatus(models.Model) :
    nama = models.CharField(max_length=120)
    subsatker = models.ForeignKey(SubSatKer, on_delete=models.CASCADE)
    pangkat = models.ManyToManyField(Pangkat)
    dsp = models.IntegerField(default=0)
    rill = models.IntegerField(default=0)

    def __str__(self) :
        return f"{self.nama} - {self.subsatker.nama}"