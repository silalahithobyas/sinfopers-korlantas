import pandas as pd
from django.db import transaction

from abc import ABC

from commons.middlewares.exception import BadRequestException

from personnel_database.models.subdit import SubDit
from personnel_database.models.subsatker import SubSatKer
from personnel_database.models.pangkat import Pangkat
from personnel_database.models.jabatan import Jabatan
from personnel_database.models.users import UserPersonil
from staffing_status.models import StaffingStatus
from authentication.models import AuthUser

class ImportDataService(ABC):
    
    @classmethod
    def import_data(cls, file, jenis) :
        if(jenis == None) :
            raise BadRequestException("Please insert type of data (personil, subdit, jabatan, subsatker, pangkat, staffing status) in query parameter")

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
        elif jenis == "personil" :
            return cls.import_data_personil(spamreader)
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
    
    @classmethod
    @transaction.atomic
    def import_data_personil(cls, spamreader):
        # Dictionary untuk menyimpan data master
        pangkat_dict = {p.nama: p for p in Pangkat.objects.all()}
        subdit_dict = {s.nama: s for s in SubDit.objects.all()}
        subsatker_dict = {s.nama: s for s in SubSatKer.objects.all()}
        jabatan_dict = {j.nama: j for j in Jabatan.objects.all()}
        
        # Dictionary untuk username ke user
        users_dict = {str(user.username): user for user in AuthUser.objects.all()}
        
        # Statistik import
        results = {
            "total": 0,
            "success": 0,
            "failed": 0,
            "errors": []
        }
        
        # Cek kolom wajib
        required_columns = ["NAMA", "NRP", "PANGKAT", "JABATAN", "JENIS_KELAMIN", "SUBSATKER", "SUBDIT", "BKO", "STATUS", "USERNAME"]
        for col in required_columns:
            if col not in spamreader.columns:
                raise BadRequestException(f"Missing required column: {col}")
        
        # Proses setiap baris
        for idx, row in spamreader.iterrows():
            results["total"] += 1
            try:
                # Validasi NRP
                try:
                    nrp = int(row["NRP"])
                except (ValueError, TypeError):
                    raise BadRequestException(f"NRP harus berupa angka: {row['NRP']}")
                
                # Ambil username dari CSV
                username = str(row["USERNAME"]).strip()
                if not username:
                    raise BadRequestException(f"Username tidak boleh kosong")
                
                # Validasi referensi
                pangkat_nama = row["PANGKAT"]
                if pangkat_nama not in pangkat_dict:
                    raise BadRequestException(f"Pangkat tidak ditemukan: {pangkat_nama}")
                
                subdit_nama = row["SUBDIT"]
                if subdit_nama not in subdit_dict:
                    raise BadRequestException(f"Subdit tidak ditemukan: {subdit_nama}")
                
                subsatker_nama = row["SUBSATKER"]
                if subsatker_nama not in subsatker_dict:
                    raise BadRequestException(f"Subsatker tidak ditemukan: {subsatker_nama}")
                
                jabatan_nama = row["JABATAN"]
                if jabatan_nama not in jabatan_dict:
                    raise BadRequestException(f"Jabatan tidak ditemukan: {jabatan_nama}")
                
                # Validasi enum
                jenis_kelamin = row["JENIS_KELAMIN"]
                if jenis_kelamin not in ["L", "P"]:
                    raise BadRequestException(f"Jenis Kelamin harus L atau P: {jenis_kelamin}")
                
                status = row["STATUS"]
                if status not in ["Aktif", "Non Aktif", "Cuti", "Pensiun"]:
                    raise BadRequestException(f"Status tidak valid: {status}")
                
                bko = row["BKO"]
                valid_bko = ["Gasus masuk", "Gasum masuk", "Gasus keluar", "Gasum keluar", "-"]
                if bko not in valid_bko:
                    raise BadRequestException(f"BKO tidak valid: {bko}")
                
                # Cek apakah NRP sudah ada - tolak jika sudah ada
                if UserPersonil.objects.filter(nrp=nrp).exists():
                    raise BadRequestException(f"NRP {nrp} sudah terdaftar. Duplikasi NRP tidak diperbolehkan.")
                
                # Cari user berdasarkan username
                user = users_dict.get(username)
                if not user:
                    raise BadRequestException(f"User dengan username '{username}' tidak ditemukan. Buat akun user terlebih dahulu.")
                
                # Cek apakah user sudah terhubung dengan personil lain
                if UserPersonil.objects.filter(user=user).exists():
                    raise BadRequestException(f"User dengan username '{username}' sudah terhubung dengan personil lain.")
                
                # Buat personil dan hubungkan dengan user
                personil = UserPersonil.objects.create(
                        nama=row["NAMA"],
                        nrp=nrp,
                        pangkat=pangkat_dict[pangkat_nama],
                        jabatan=jabatan_dict[jabatan_nama],
                        jenis_kelamin=jenis_kelamin,
                        subsatker=subsatker_dict[subsatker_nama],
                        subdit=subdit_dict[subdit_nama],
                        bko=bko,
                    status=status,
                    user=user
                    )
                
                results["success"] += 1
                
            except Exception as e:
                results["failed"] += 1
                error_message = f"Error pada baris {idx+2}: {str(e)}"
                results["errors"].append(error_message)
        
        return results
