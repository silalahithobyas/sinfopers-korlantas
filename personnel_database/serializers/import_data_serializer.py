from rest_framework import serializers

class ImportDataSerializer(serializers.Serializer) :
    file = serializers.FileField()