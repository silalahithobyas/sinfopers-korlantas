from abc import ABC
from personnel_database.models.jabatan import Jabatan

class JabatanService(ABC):
    
    @classmethod
    def get_all_jabatan(cls) :
        jabatan_list = Jabatan.objects.all()
        return jabatan_list