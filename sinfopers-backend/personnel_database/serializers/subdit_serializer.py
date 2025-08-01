from rest_framework import serializers
from personnel_database.models.subdit import SubDit

class SubditSerializer(serializers.ModelSerializer) :
    class Meta:
        model = SubDit
        fields = ['id', 'nama']