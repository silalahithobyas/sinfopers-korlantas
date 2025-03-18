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
    @transaction.atomic
    def get_chart(cls, chart_id) :
        chart = Chart.objects.filter(id = chart_id).first()

        if(not chart) :
            raise BadRequestException(f"Chart with id {chart_id} not exists.")

        return chart

    @classmethod
    def delete_chart(cls, chart_id) :
        chart = Chart.objects.filter(id=chart_id).first()
        if(not chart) :
            raise BadRequestException(f"Chart with id {chart_id} not exists.")

        chart.delete()
        return chart

    @classmethod
    def get_all_chart_name(cls) :
        chart = Chart.objects.all()
        return chart
