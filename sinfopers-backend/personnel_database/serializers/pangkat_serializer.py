from rest_framework import serializers
from personnel_database.models.pangkat import Pangkat

class PangkatSerializer(serializers.ModelSerializer) :
    class Meta:
        model = Pangkat
        fields = ['id', 'nama']