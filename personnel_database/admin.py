from django.contrib import admin

from personnel_database.models.pangkat import Pangkat
from personnel_database.models.subdit import SubDit
from personnel_database.models.subsatker import SubSatKer
from personnel_database.models.jabatan import Jabatan
from personnel_database.models.users import UserPersonil


admin.site.register(Pangkat)
admin.site.register(SubDit)
admin.site.register(SubSatKer)
admin.site.register(Jabatan)
admin.site.register(UserPersonil)
