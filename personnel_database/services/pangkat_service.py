from abc import ABC, abstractmethod
from personnel_database.models.pangkat import Pangkat

class PangkatService(ABC):
    
    @classmethod
    def get_all_pangkat(cls) :
        pangkat_list = Pangkat.objects.all()
        return pangkat_list