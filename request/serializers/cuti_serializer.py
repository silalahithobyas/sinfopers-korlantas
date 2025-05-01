from rest_framework import serializers
from ..models.cuti import CutiRequest

class CutiSerializer(serializers.ModelSerializer):
    class Meta:
        model = CutiRequest
        fields = ['tanggal_mulai', 'tanggal_selesai', 'alasan']
        extra_kwargs = {
            'tanggal_mulai': {'required': True},
            'tanggal_selesai': {'required': True},
            'alasan': {'required': True,
                       'error_message': {
                           'required': 'Alasan cuti wajib diisi'
                       }
            }
        }

    def validate(self, data):
        if data['tanggal_mulai'] > data['tanggal_selesai']:
            raise serializers.ValidationError("Tanggal selesai harus setelah tanggal mulai")
        return data