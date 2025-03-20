from rest_framework import serializers
from personnel_database.models.jabatan import Jabatan

class JabatanSerializer(serializers.ModelSerializer) :
    class Meta:
        model = Jabatan
        fields = ['id', 'nama']