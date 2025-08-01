from rest_framework import serializers

class StaffingStatusDataSerializer(serializers.Serializer) :
    pangkat = serializers.CharField()
    dsp = serializers.IntegerField()

class StaffingStatusRequestSerializer(serializers.Serializer) :
    satker = serializers.CharField()
    data = StaffingStatusDataSerializer(many=True)