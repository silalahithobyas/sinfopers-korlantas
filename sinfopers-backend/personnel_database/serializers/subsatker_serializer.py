from rest_framework import serializers
from personnel_database.models.subsatker import SubSatKer

class SubSatKerSerializer(serializers.ModelSerializer) :
    class Meta:
        model = SubSatKer
        fields = ['id', 'nama']