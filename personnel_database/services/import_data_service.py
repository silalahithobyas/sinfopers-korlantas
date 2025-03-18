import pandas as pd
from django.db import transaction

from abc import ABC

from commons.middlewares.exception import BadRequestException

from personnel_database.models.subdit import SubDit
from personnel_database.models.subsatker import SubSatKer
from personnel_database.models.pangkat import Pangkat
from personnel_database.models.jabatan import Jabatan
from staffing_status.models import StaffingStatus

class ImportDataService(ABC):
    
    @classmethod
    def import_data(cls, file, jenis) :
        if(jenis == None) :
            raise BadRequestException("Please insert type of data (subdit, jabatan, subsatker, pangkat, staffing status) in query parameter")

        if(file.content_type != "text/csv") :
            raise BadRequestException("Please insert csv file.")
        
        spamreader = pd.read_csv(file, sep=",")
        if jenis == "subdit" :
            cls.import_data_subit(spamreader)
        elif jenis == "subsatker" :
            cls.import_data_subsatker(spamreader)
        elif jenis == "pangkat" :
            cls.import_data_pangkat(spamreader)
        elif jenis == "staffing status" :
            cls.import_data_staffing_status(spamreader)
        elif jenis == "jabatan" :
            cls.import_data_jabatan(spamreader)
        else :
            raise BadRequestException(f"Jenis {jenis} not exists.")

        return f"Success import data {jenis}"
    
    @classmethod
    def import_data_subit(cls, spamreader) :
        subdit_list = []
        for _, row in spamreader.iterrows() :
            col = row.get("SUBDIT", None)
            if not col :
                raise BadRequestException("Missing Column SUBDIT")
            subdit_list.append(SubDit(nama=row['SUBDIT']))

        SubDit.objects.bulk_create(subdit_list, ignore_conflicts=True)

    @classmethod
    def import_data_subsatker(cls, spamreader) :
        subsatker_list = []
        for _, row in spamreader.iterrows() :
            col = row.get("SUBSATKER", None)
            if not col :
                raise BadRequestException("Missing Column SUBSATKER")
            subsatker_list.append(SubSatKer(nama=row['SUBSATKER']))

        SubSatKer.objects.bulk_create(subsatker_list, ignore_conflicts=True)

    @classmethod
    def import_data_jabatan(cls, spamreader) :
        jabatan_list = []
        for _, row in spamreader.iterrows() :
            col = row.get("JABATAN", None)
            if not col :
                raise BadRequestException("Missing Column JABATAN")
            jabatan_list.append(Jabatan(nama=row['JABATAN']))

        Jabatan.objects.bulk_create(jabatan_list, ignore_conflicts=True)        

    @classmethod
    def import_data_pangkat(cls, spamreader) :
        pangkat_list = []
        for _, row in spamreader.iterrows() :
            col_pangkat = row.get("PANGKAT", None)
            col_tipe = row.get("TIPE", None)
            if not col_pangkat :
                raise BadRequestException("Missing Column PANGKAT")
            
            if not col_tipe :
                raise BadRequestException("Missing Column TIPE")
            
            pangkat_list.append(Pangkat(nama=col_pangkat, tipe=col_tipe))

        Pangkat.objects.bulk_create(pangkat_list, ignore_conflicts=True)

    @classmethod
    @transaction.atomic
    def import_data_staffing_status(cls, spamreader) :
        staffing_status_list = []
        pangkat_dict = {}
        staffing_pangkat_dict = {}
        
        pangkat_list = Pangkat.objects.all()
        subsatker_list = SubSatKer.objects.all()

        for i in pangkat_list :
            pangkat_dict[i.nama] = i

        for _, row in spamreader.iterrows() :
            col_pangkat = row.get("PANGKAT", None)
            col_staffing_status = row.get("STAFFING STATUS", None)
            if not col_pangkat :
                raise BadRequestException("Missing Column PANGKAT")
            
            if(not col_staffing_status) :
                raise BadRequestException("Missing Column STAFFING STATUS")
            
            pangkat_list = []
            for i in col_pangkat.split(", ") :
                pangkat_object = pangkat_dict.get(i, None)
                if(not pangkat_object) :
                    raise BadRequestException(f"Pangkat {i} not exists.")
                pangkat_list.append(pangkat_object)

            for i in subsatker_list :
                staffing_status_object = StaffingStatus(nama=col_staffing_status, subsatker=i)
                staffing_status_list.append(staffing_status_object)
            
            staffing_pangkat_dict[col_staffing_status] = pangkat_list

        StaffingStatus.objects.bulk_create(staffing_status_list, ignore_conflicts=True)
        staffing_status_list = StaffingStatus.objects.all()

        for i in staffing_status_list : 
            staffing_pangkat = staffing_pangkat_dict.get(i.nama, None)
            if(not staffing_pangkat) :
                raise BadRequestException(f"Staffing Status {i.nama} not exists.")
            i.pangkat.add(*staffing_pangkat)
