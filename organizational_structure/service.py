from abc import ABC
from django.db import transaction

from commons.middlewares.exception import BadRequestException

from organizational_structure.models import Chart, Nodes
from personnel_database.models.users import UserPersonil

class OrganizationalStructureService(ABC):

    @classmethod
    @transaction.atomic
    def create_chart(cls, **data) :
        nama = data.pop('nama_chart')
        personnel_id = data.pop("personnel_id")
        personnel = UserPersonil.objects.filter(id=personnel_id).first()

        if(not personnel) :
            raise BadRequestException(f"Personnel with id {personnel_id} not exists.")

        nodes = Nodes.objects.create(personnel=personnel)
        chart = Chart.objects.create(nama=nama, nodes=nodes)

        return chart

    @classmethod
    def update_nodes(cls, nodes_id, **data) :
        nodes = Nodes.objects.filter(id=nodes_id).first()
        personnel_id = data.pop("personnel_id")
        personnel = UserPersonil.objects.filter(id=personnel_id).first()

        if(not nodes) :
            raise BadRequestException(f"Nodes with id {nodes_id} not exists.")

        if(not personnel) :
            raise BadRequestException(f"Personnel with id {personnel_id} not exists.")

        nodes.personnel = personnel
        nodes.save()
        return nodes

    @classmethod
    @transaction.atomic
    def create_child_node(cls, chart_id, **data) :
        parent_id = data.pop('parent_id')
        personnel_id = data.pop('personnel_id')
        parent_node = Nodes.objects.filter(id=parent_id).first()
        personnel = UserPersonil.objects.filter(id=personnel_id).first()

        if(not parent_node) :
            raise BadRequestException(f"Node with id {parent_id} not exists.")

        if(not personnel) :
            raise BadRequestException(f"Personnel with id {personnel_id} not exists.")


        chart = cls.get_chart(chart_id)
        child_node = Nodes.objects.create(**data, personnel=personnel)
        parent_node.child.add(child_node)

        return chart

