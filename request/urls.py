from django.urls import path
from request.views import show_request, create_cuti_request, create_mutasi_request, show_xml, show_json, show_xml_by_id, show_json_by_id

app_name = 'request'

urlpatterns = [
    path('', show_request, name='show_request'),
    path('create-request-cuti/', create_cuti_request, name='show-request-cuti'),
    path('create-request-mutasi/', create_mutasi_request, name='show-request-mutasi'),
    path('xml/', show_xml, name='show_xml'),
    path('json/', show_json, name='show_json'),
    path('xml/<str:id>/', show_xml_by_id, name='show_xml_by_id'),
    path('json/<str:id>/', show_json_by_id, name='show_json_by_id'),
]