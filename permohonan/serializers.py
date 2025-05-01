from rest_framework import serializers
from .models import Permohonan
from authentication.models import AuthUser

class PermohonanSerializer(serializers.ModelSerializer):
    personel_username = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    jenis_permohonan_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Permohonan
        fields = [
            'id', 'personel', 'personel_username', 'jenis_permohonan', 
            'jenis_permohonan_display', 'alasan', 'file_pendukung', 
            'status', 'status_display', 'catatan_hr', 'catatan_pimpinan',
            'date_created', 'date_updated'
        ]
        read_only_fields = ['personel', 'status', 'catatan_hr', 'catatan_pimpinan']
    
    def get_personel_username(self, obj):
        return obj.personel.username
    
    def get_status_display(self, obj):
        return obj.get_status_display()
    
    def get_jenis_permohonan_display(self, obj):
        return obj.get_jenis_permohonan_display()
    
    def create(self, validated_data):
        # Set personel to current user
        user = self.context['request'].user
        validated_data['personel'] = user
        return super().create(validated_data)

class PermohonanHRSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permohonan
        fields = ['id', 'status', 'catatan_hr']
        read_only_fields = ['id']

class PermohonanPimpinanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permohonan
        fields = ['id', 'status', 'catatan_pimpinan']
        read_only_fields = ['id'] 