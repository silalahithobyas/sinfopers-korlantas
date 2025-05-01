from ..models.cuti import CutiRequest
from django.core.exceptions import ValidationError
from datetime import date

class CutiService:
    @staticmethod
    def create_cuti(user, validated_data):
        if validated_data['tanggal_mulai'] > validated_data['tanggal_selesai']:
            raise ValidationError("Tanggal tidak valid")
        
        if validated_data['tanggal_mulai'] < date.today():
            raise ValidationError("Tanggal mulai tidak boleh di masa lalu")
            
        return CutiRequest.objects.create(
            user=user,
            status="dikirim",
            **validated_data
        )