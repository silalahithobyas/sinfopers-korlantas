from rest_framework import serializers
from .models import Information, InformationLog
from authentication.models import AuthUser
from django.utils import timezone

class InformationSerializer(serializers.ModelSerializer):
    penulis_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Information
        fields = [
            'information_id',
            'information_title',
            'information_context',
            'file_pendukung',
            'penulis_username',
            'date_created',
            'date_updated',
        ]
        read_only_fields = ['penulis_username', 'date_created', 'date_updated']
    
    def get_penulis_username(self, obj):
        return obj.penulis.username
    
    def create(self, validated_data):
        # Set personel to current user
        user = self.context['request'].user
        validated_data['penulis'] = user
        return super().create(validated_data)

class InformationLogSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()

    class Meta:
        model = InformationLog
        fields = ['action', 'timestamp', 'detail', 'user_username']

    def get_user_username(self, obj):
        return obj.user.username if obj.user else "Pengguna tidak dikenal"