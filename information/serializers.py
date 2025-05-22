from rest_framework import serializers
from .models import Information
from authentication.models import AuthUser
from django.utils import timezone

class InformationSerializer(serializers.ModelSerializer):
    penulis_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Information
        fields = '__all__'
        read_only_fields = [
        ]
    
    def get_penulis_username(self, obj):
        return obj.penulis.username
    
    def create(self, validated_data):
        # Set personel to current user
        user = self.context['request'].user
        validated_data['penulis'] = user
        return super().create(validated_data)
    
    def validate_file_pendukung(self, value):
        # Hanya validasi file untuk request create baru, bukan untuk data lama
        if 'create' in self.context.get('view', {}).action and not value:
            raise serializers.ValidationError("File pendukung wajib diunggah")
        return value