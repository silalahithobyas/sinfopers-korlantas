from django.urls import path
from personnel_database.views.pangkat_views import PangkatView
from personnel_database.views.user_management import IncompleteAnggotaPimpinanUsersView
from personnel_database.views.user_personil_views import PersonilView, PersonilExport
from personnel_database.views.personil_user_link_view import LinkPersonilToUserView
from personnel_database.views.subdit_views import SubditView
from personnel_database.views.pangkat_views import PangkatView
from personnel_database.views.jabatan_views import JabatanView
from personnel_database.views.subsatker_views import SubSatKerView
from personnel_database.views.jabatan_views import JatabanView
from personnel_database.views.import_data_views import ImportDataView
from authentication.views.user_management import UserManagementView

app_name = 'personnel_database'

urlpatterns = [
    # Endpoint statis harus di atas endpoint dinamis dengan parameter
    path('', PersonilView.as_view()),
    path('export/', PersonilExport.as_view()),
    path('link-to-user/', LinkPersonilToUserView.as_view()),
    
    # Endpoints reference data - HARUS di atas endpoint dinamis
    path('pangkat/', PangkatView.as_view()),
    path('subdit/', SubditView.as_view()),
    path('jabatan/', JabatanView.as_view()),
    path('subsatker/', SubSatKerView.as_view()),
    
    # Endpoint dengan parameter dinamis HARUS di bawah endpoint statis
    # Ini akan mencocokkan segala yang belum dicocokkan di atas
    path('<str:personil_id>/', PersonilView.as_view()),
    path('', PersonilView.as_view()),
    path('user-data/', UserManagementView.as_view()),
]