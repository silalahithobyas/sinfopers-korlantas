from rest_framework import serializers

from organizational_structure.models import Nodes, Chart

class UpdateNodeSerializer(serializers.Serializer) :
    personnel_id = serializers.CharField()

class DeleteNodeSerializer(serializers.Serializer) :
    node_id = serializers.IntegerField()

class CreateNodeSerializer(serializers.Serializer) :
    parent_id = serializers.IntegerField()
    personnel_id = serializers.CharField()
    offset = serializers.BooleanField()

class RecursiveSerializer(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class PersonnelSerializer(serializers.Serializer) :
    id = serializers.CharField()
    nama = serializers.CharField()
    jabatan = serializers.CharField()

class NodeSerializer(serializers.ModelSerializer) :
    personnel = PersonnelSerializer()
    child = RecursiveSerializer(many=True, read_only=True)
    child_offsets = RecursiveSerializer(many=True, read_only=True)
    class Meta:
        model = Nodes
        exclude = ['created_at', 'updated_at']

class ChartSerializer(serializers.ModelSerializer) :
    nodes = NodeSerializer()
    class Meta:
        model = Chart
        exclude = ['created_at', 'updated_at']

class ChartNameSerializer(serializers.ModelSerializer) :

    class Meta:
        model = Chart
        fields = ['id', 'nama']

class CreateChartSerializer(serializers.Serializer) :
    nama_chart = serializers.CharField()
    personnel_id = serializers.CharField()
