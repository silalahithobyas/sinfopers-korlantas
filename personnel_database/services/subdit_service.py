from abc import ABC, abstractmethod
from personnel_database.models.subdit import SubDit

class SubditService(ABC):
    
    @classmethod
    def get_all_subdit(cls) :
        subdit_list = SubDit.objects.all()
        return subdit_list