from rest_framework import serializers
from .models import Permohonan, SaldoCuti
from authentication.models import AuthUser
from django.utils import timezone

class PermohonanSerializer(serializers.ModelSerializer):
    personel_username = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    jenis_permohonan_display = serializers.SerializerMethodField()
    hr_reviewer_name = serializers.SerializerMethodField()
    pimpinan_reviewer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Permohonan
        fields = [
            'id', 'personel', 'personel_username', 'jenis_permohonan', 
            'jenis_permohonan_display', 'alasan', 'file_pendukung', 
            'status', 'status_display', 
            'hr_reviewer', 'hr_reviewer_name', 'hr_review_date', 'catatan_hr',
            'pimpinan_reviewer', 'pimpinan_reviewer_name', 'pimpinan_review_date', 'catatan_pimpinan',
            'date_created', 'date_updated', 'tanggal_mulai_cuti', 'tanggal_selesai_cuti'
        ]
        read_only_fields = [
            'personel', 'status', 'hr_reviewer', 'hr_review_date', 
            'catatan_hr', 'pimpinan_reviewer', 'pimpinan_review_date', 'catatan_pimpinan'
        ]
    
    def get_personel_username(self, obj):
        return obj.personel.username
    
    def get_status_display(self, obj):
        return obj.get_status_display()
    
    def get_jenis_permohonan_display(self, obj):
        return obj.get_jenis_permohonan_display()
    
    def get_hr_reviewer_name(self, obj):
        if obj.hr_reviewer:
            return obj.hr_reviewer.get_full_name() or obj.hr_reviewer.username
        return None
    
    def get_pimpinan_reviewer_name(self, obj):
        if obj.pimpinan_reviewer:
            return obj.pimpinan_reviewer.get_full_name() or obj.pimpinan_reviewer.username
        return None

    def validate(self, data):
        if data.get('jenis_permohonan') == Permohonan.JenisPermohonan.CUTI:
            tanggal_mulai = data.get('tanggal_mulai')
            tanggal_selesai = data.get('tanggal_selesai')
            
            if not tanggal_mulai or not tanggal_selesai:
                raise serializers.ValidationError("Tanggal mulai dan tanggal selesai wajib diisi untuk permohonan cuti.")
            
            if tanggal_mulai > tanggal_selesai:
                raise serializers.ValidationError("Tanggal mulai tidak boleh lebih besar dari tanggal selesai.")
            
            jumlah_hari = (tanggal_selesai - tanggal_mulai).days + 1
            
            tahun_cuti = tanggal_mulai.year
            personel = self.context['request'].user
            saldo = SaldoCuti.get_or_create_for_year(personel, tahun_cuti)
            
            if jumlah_hari > saldo.sisa_cuti:
                raise serializers.ValidationError(
                    f"Jumlah hari cuti yang diajukan ({jumlah_hari} hari) melebihi sisa saldo cuti Anda ({saldo.sisa_cuti} hari)."
                )
            
            data['jumlah_hari'] = jumlah_hari
        
        return data

    def create(self, validated_data):
        # Set personel to current user
        user = self.context['request'].user
        validated_data['personel'] = user
        return super().create(validated_data)
    
    def validate_file_pendukung(self, value):
        # Hanya validasi file untuk request create baru, bukan untuk data lama
        if 'create' in self.context.get('view', {}).action and not value:
            raise serializers.ValidationError("File pendukung wajib diunggah")
        return value

class PermohonanHRSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permohonan
        fields = ['id', 'status', 'catatan_hr', 'hr_reviewer', 'hr_review_date']
        read_only_fields = ['id', 'hr_reviewer', 'hr_review_date']
        
    def validate(self, data):
        # Jika status 'tidak_valid', catatan_hr harus diisi
        if data.get('status') == 'tidak_valid' and not data.get('catatan_hr'):
            raise serializers.ValidationError({
                "catatan_hr": "Catatan HR wajib diisi jika status Tidak Valid"
            })
        
        # Tambahkan informasi reviewer dan waktu
        data['hr_reviewer'] = self.context.get('request').user
        data['hr_review_date'] = timezone.now()
        
        return data

class PermohonanPimpinanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permohonan
        fields = ['id', 'status', 'catatan_pimpinan', 'pimpinan_reviewer', 'pimpinan_review_date']
        read_only_fields = ['id', 'pimpinan_reviewer', 'pimpinan_review_date']
        
    def validate(self, data):
        # Jika status 'ditolak', catatan_pimpinan harus diisi
        if data.get('status') == 'ditolak' and not data.get('catatan_pimpinan'):
            raise serializers.ValidationError({
                "catatan_pimpinan": "Catatan Pimpinan wajib diisi jika permohonan ditolak"
            })
        
        # Tambahkan informasi reviewer dan waktu
        data['pimpinan_reviewer'] = self.context.get('request').user
        data['pimpinan_review_date'] = timezone.now()
        
        return data 