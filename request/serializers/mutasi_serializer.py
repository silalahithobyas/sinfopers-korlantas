from rest_framework import serializers
from ..models.mutasi import MutasiRequest

class MutasiSerializer(serializers.ModelSerializer):
    class Meta:
        model = MutasiRequest
        fields = ['alamat_baru']
        extra_kwargs = {
            'alamat_baru': {
                'required': True,
                'error_messages': {
                    'required': 'Alamat baru wajib diisi'
                }
            }
        }