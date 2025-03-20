from rest_framework import serializers
from personnel_database.models.users import UserPersonil
from staffing_status.models import StaffingStatus

from commons.middlewares.exception import BadRequestException

from django.db.models import Q
from django.db import transaction


class UserPersonilSerializer(serializers.ModelSerializer) :
    pangkat = serializers.CharField(source="pangkat.nama")
    subsatker = serializers.CharField(source="subsatker.nama")
    subdit = serializers.CharField(source="subdit.nama")
    jabatan = serializers.CharField(source="jabatan.nama")
    class Meta:
        model = UserPersonil
        exclude = ['created_at', 'updated_at']
    
class UpdateUserPersonilSerializer(serializers.ModelSerializer) :
    class Meta:
        model = UserPersonil
        exclude = ['created_at', 'updated_at']

    def update(self, instance, validated_data) :    
        return super().update(instance, validated_data)  


class PaginationSerializer(serializers.Serializer) :
    total_pages = serializers.CharField()
    current_page = serializers.CharField()
    limit = serializers.CharField()
    total_item = serializers.CharField()
    has_next = serializers.BooleanField()
    has_previous = serializers.BooleanField()

class UserPersonilPaginationSerializer(serializers.Serializer) :
    result = UserPersonilSerializer(many=True)
    meta = PaginationSerializer()