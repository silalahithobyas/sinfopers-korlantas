# personnel_database/models/users.py
import enum
import uuid
import logging

from django.core.validators import MaxValueValidator
from django.db import models
from django.db.models import Q

from authentication.models.base import BaseModel
from personnel_database.models.pangkat import Pangkat
from personnel_database.models.subsatker import SubSatKer
from personnel_database.models.subdit import SubDit
from personnel_database.models.jabatan import Jabatan

from staffing_status.models import StaffingStatus

from commons.middlewares.exception import BadRequestException

logger = logging.getLogger('general')

class UserPersonil(BaseModel) :

    class JenisKelamin(str, enum.Enum):
        L = "L"
        P = "P"

        @classmethod
        def choices(cls):
            return [(item.value, item.name) for item in cls]
    
    class Status(str, enum.Enum) :
        AKTIF = "Aktif"
        NON_AKTIF = "Non Aktif"
        CUTI = "Cuti"
        PENSIUN = "Pensiun"

        @classmethod
        def choices(cls):
            return [(item.value, item.name) for item in cls]
        
    class BKO(str, enum.Enum) :
        GASUS_MASUK = "Gasus masuk"
        GASUM_MASUK = "Gasum masuk"
        GASUS_KELUAR = "Gasus keluar"
        GASUM_KELUAR = "Gasum keluar"
        NOT_GASUS = "-"

        @classmethod
        def choices(cls):
            return [(item.value, item.name) for item in cls]
        
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    nama = models.CharField(max_length=120)
    pangkat = models.ForeignKey(Pangkat, on_delete=models.CASCADE)
    nrp = models.IntegerField(validators=[MaxValueValidator(99999999)])
    jabatan = models.ForeignKey(Jabatan, on_delete=models.CASCADE)
    jenis_kelamin = models.CharField(max_length=12, choices=JenisKelamin.choices())
    subsatker = models.ForeignKey(SubSatKer, on_delete=models.CASCADE)
    subdit = models.ForeignKey(SubDit, on_delete=models.CASCADE)
    bko = models.CharField(max_length=12, choices=BKO.choices())
    status = models.CharField(max_length=20, choices=Status.choices())

    def __str__(self) :
        return self.nama

    def save(self, *args, **kwargs) :
        logger.info(f"[DEBUG] Attempting to save personnel with pangkat_id: {self.pangkat_id}, subsatker_id: {self.subsatker_id}")
        
        staffing_status = StaffingStatus.objects.filter(
            Q(subsatker=self.subsatker) & Q(pangkat=self.pangkat)
        ).first()
        
        logger.info(f"[DEBUG] Found staffing status: {staffing_status}")
        
        if not staffing_status:
            error_msg = f"Failed to add User Personnel: No staffing status found for pangkat_id={self.pangkat_id} and subsatker_id={self.subsatker_id}"
            logger.error(f"[DEBUG] {error_msg}")
            raise BadRequestException(error_msg)
        
        logger.info(f"[DEBUG] Current rill value: {staffing_status.rill}")
        staffing_status.rill = staffing_status.rill + 1
        logger.info(f"[DEBUG] New rill value: {staffing_status.rill}")
        
        try:
            staffing_status.save()
            logger.info("[DEBUG] Successfully updated staffing status")
            super(UserPersonil, self).save(*args, **kwargs)
            logger.info("[DEBUG] Successfully saved personnel")
        except Exception as e:
            logger.error(f"[DEBUG] Error saving: {str(e)}")
            raise

    def delete(self, *args, **kwargs) :
        logger.info(f"[DEBUG] Attempting to delete personnel with pangkat_id: {self.pangkat_id}, subsatker_id: {self.subsatker_id}")
        
        staffing_status = StaffingStatus.objects.filter(
            Q(subsatker=self.subsatker) & Q(pangkat=self.pangkat)
        ).first()
        
        logger.info(f"[DEBUG] Found staffing status: {staffing_status}")
        
        if not staffing_status:
            error_msg = f"Failed to delete User Personnel: No staffing status found for pangkat_id={self.pangkat_id} and subsatker_id={self.subsatker_id}"
            logger.error(f"[DEBUG] {error_msg}")
            raise BadRequestException(error_msg)

        logger.info(f"[DEBUG] Current rill value: {staffing_status.rill}")
        staffing_status.rill = staffing_status.rill - 1
        logger.info(f"[DEBUG] New rill value: {staffing_status.rill}")
        
        try:
            staffing_status.save()
            logger.info("[DEBUG] Successfully updated staffing status")
            super(UserPersonil, self).delete(*args, **kwargs)
            logger.info("[DEBUG] Successfully deleted personnel")
        except Exception as e:
            logger.error(f"[DEBUG] Error deleting: {str(e)}")
            raise