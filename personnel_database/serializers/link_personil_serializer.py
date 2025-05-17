from rest_framework import serializers
import uuid

class LinkPersonilToUserSerializer(serializers.Serializer):
    """
    Serializer untuk validasi data saat membuat personil baru yang terhubung
    dengan user yang sudah ada
    """
    # Field user yang sudah ada
    user_id = serializers.UUIDField(required=True)
    
    # Fields untuk personil baru
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
        """Helper method to check if a string is a valid UUID"""
        try:
            uuid.UUID(str(val))
            return True
        except (ValueError, TypeError):
            return False
    
    def validate_nrp(self, value):
        """Validasi NRP unik"""
        from personnel_database.models.users import UserPersonil
        if UserPersonil.objects.filter(nrp=value).exists():
            raise serializers.ValidationError("NRP sudah terdaftar. Silakan periksa kembali data Anda.")
        return value
    
    def validate(self, data):
        """Validasi tambahan untuk referensi ID"""
        # Validasi pangkat, jabatan, subsatker, subdit
        # Kita bisa menggunakan validasi yang lebih kompleks di sini jika perlu
        return data 