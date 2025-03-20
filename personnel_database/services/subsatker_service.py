from abc import ABC, abstractmethod
from personnel_database.models.subsatker import SubSatKer

class SubSatKerService(ABC):
    
    @classmethod
    def get_all_subsatker(cls) :
        subdit_list = SubSatKer.objects.all()
        return subdit_list