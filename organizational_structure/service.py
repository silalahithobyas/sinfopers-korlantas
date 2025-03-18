from abc import ABC
from django.db import transaction

from commons.middlewares.exception import BadRequestException

from organizational_structure.models import Chart, Nodes
from personnel_database.models.users import UserPersonil

class OrganizationalStructureService(ABC):
    pass
