from rest_framework import serializers
from django.db import transaction
import uuid
import logging
from django.db.utils import IntegrityError
from django.core.exceptions import ValidationError as DjangoValidationError

from authentication.models import AuthUser
from authentication.serializers.user_serializer import UserCreateSerializer, UserSerializer
from personnel_database.models.users import UserPersonil
from personnel_database.serializers.user_personil_serializer import UserPersonilSerializer

logger = logging.getLogger('general')

class UserPersonilCreateSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.CharField(required=True)
    
    # Personil fields
    nama = serializers.CharField(required=True)
    jenis_kelamin = serializers.CharField(required=True)
    nrp = serializers.IntegerField(required=True)
    status = serializers.CharField(required=True)
    jabatan = serializers.CharField(required=True)
    pangkat = serializers.CharField(required=True)
    subsatker = serializers.CharField(required=True)
    subdit = serializers.CharField(required=True)
    bko = serializers.CharField(required=True)

    def is_valid_uuid(self, val):
        try:
            uuid.UUID(str(val))
            return True
        except (ValueError, TypeError):
            return False
            
    def validate_username(self, value):
        """
        Validasi username unik
        """
        if AuthUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username sudah digunakan. Silakan pilih username lain.")
        return value
        
    def validate_nrp(self, value):
        """
        Validasi NRP unik
        """
        if UserPersonil.objects.filter(nrp=value).exists():
            raise serializers.ValidationError("NRP sudah terdaftar. Silakan periksa kembali data Anda.")
        return value

    def create(self, validated_data):
        """
        Buat user dan personil dalam satu transaksi
        """
        # Extract user data
        user_data = {
            'username': validated_data.get('username'),
            'email': validated_data.get('email', ''),
            'password': validated_data.get('password'),
            'role': validated_data.get('role'),
        }
        
        # Extract personil data
        personil_data = {
            'nama': validated_data.get('nama'),
            'jenis_kelamin': validated_data.get('jenis_kelamin'),
            'nrp': validated_data.get('nrp'),
            'status': validated_data.get('status'),
            'bko': validated_data.get('bko'),
        }
        
        # Proses field ID secara manual sebelum transaction
        processed_ids = {}
        for field in ['jabatan', 'pangkat', 'subsatker', 'subdit']:
            field_value = validated_data.get(field)
            field_id = None
            
            if self.is_valid_uuid(field_value):
                # Jika UUID valid, gunakan langsung
                field_id = field_value
            else:
                # Jika bukan UUID, coba ambil objek
                try:
                    if field == 'jabatan':
                        from personnel_database.models.jabatan import Jabatan
                        obj = Jabatan.objects.filter(pk=field_value).first()
                        if obj:
                            field_id = str(obj.id)
                    elif field == 'pangkat':
                        from personnel_database.models.pangkat import Pangkat
                        obj = Pangkat.objects.filter(pk=field_value).first()
                        if obj:
                            field_id = str(obj.id)
                    elif field == 'subsatker':
                        from personnel_database.models.subsatker import SubSatKer
                        obj = SubSatKer.objects.filter(pk=field_value).first()
                        if obj:
                            field_id = str(obj.id)
                    elif field == 'subdit':
                        from personnel_database.models.subdit import SubDit
                        obj = SubDit.objects.filter(pk=field_value).first()
                        if obj:
                            field_id = str(obj.id)
                except Exception as e:
                    logger.error(f"Error saat mencari objek {field} dengan id {field_value}: {str(e)}")
            
            if not field_id:
                raise serializers.ValidationError({field: f"Data {field} tidak valid atau tidak ditemukan: {field_value}"})
            
            processed_ids[field] = field_id
            
        # Tambahkan semua ID yang sudah diproses ke data personil
        for field, field_id in processed_ids.items():
            personil_data[field] = field_id
        
        # Panggil transaction.atomic sebagai context manager, bukan decorator
        # untuk penanganan error yang lebih baik
        try:
            with transaction.atomic():
                # Cek duplikat username dan NRP sekali lagi (untuk keamanan) sebelum create
                if AuthUser.objects.filter(username=user_data['username']).exists():
                    raise serializers.ValidationError({
                        "username": "Username sudah digunakan. Silakan pilih username lain."
                    })
                
                # Cek duplikat NRP sekali lagi
                if UserPersonil.objects.filter(nrp=personil_data['nrp']).exists():
                    raise serializers.ValidationError({
                        "nrp": "NRP sudah terdaftar. Silakan periksa kembali data Anda."
                    })
                
                # Log data yang akan dibuat
                logger.info(f"Creating user with data: {user_data}")
                logger.info(f"Creating personil with data: {personil_data}")
                
                # Create user
                user_serializer = UserCreateSerializer(data=user_data)
                user_serializer.is_valid(raise_exception=True)
                user = user_serializer.save()
                
                # Create personil
                from personnel_database.services.user_personil_service import UserPersonilService
                try:
                    personil = UserPersonilService.add_personil(**personil_data)
                except Exception as personil_error:
                    # Secara eksplisit hapus user jika pembuatan personil gagal
                    # (seharusnya tidak perlu karena atomic, tapi untuk jaga-jaga)
                    if user and user.id:
                        user.delete()
                    raise serializers.ValidationError({"personil": f"Gagal membuat personil: {str(personil_error)}"})
                
                # Link user with personil
                personil.user = user
                personil.save()
                
                # Return combined data
                return {
                    'user': UserSerializer(user).data,
                    'personil': UserPersonilSerializer(personil).data
                }
        except IntegrityError as e:
            # Tangani integrity error (mis. constraint unique)
            error_msg = str(e)
            error_field = "unknown"
            
            if "username" in error_msg.lower():
                error_field = "username"
                error_msg = "Username sudah digunakan. Silakan pilih username lain."
            elif "nrp" in error_msg.lower():
                error_field = "nrp"
                error_msg = "NRP sudah terdaftar. Silakan periksa kembali data Anda."
                
            logger.error(f"IntegrityError: {error_msg}")
            raise serializers.ValidationError({error_field: error_msg})
            
        except serializers.ValidationError as e:
            # Re-raise validasi error yang sudah spesifik
            logger.error(f"ValidationError: {str(e)}")
            raise
            
        except Exception as e:
            # Log semua exception untuk debugging
            import traceback
            logger.error(f"Error in create user and personil transaction: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Coba identifikasi jenis error untuk error message yang lebih spesifik
            error_msg = str(e)
            if "already exists" in error_msg.lower() or "duplicate" in error_msg.lower():
                if "username" in error_msg.lower():
                    raise serializers.ValidationError({"username": "Username sudah digunakan. Silakan pilih username lain."})
                elif "nrp" in error_msg.lower():
                    raise serializers.ValidationError({"nrp": "NRP sudah terdaftar. Silakan periksa kembali data Anda."})
                else:
                    raise serializers.ValidationError({"detail": f"Terjadi duplikasi data: {error_msg}"})
            elif "foreign key" in error_msg.lower():
                raise serializers.ValidationError({"detail": "Referensi data tidak valid. Pastikan semua referensi (pangkat, jabatan, dll) valid."})
            else:
                # Re-raise exception agar ditangkap oleh view
                raise serializers.ValidationError({"detail": f"Terjadi kesalahan: {error_msg}"}) 