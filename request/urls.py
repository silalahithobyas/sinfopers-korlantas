from django.urls import path
from request.views.cuti_view import CutiCreateView
from request.views.mutasi_view import MutasiCreateView
from request.views.list_view import RequestListView

urlpatterns = [
    path('', RequestListView.as_view(), name='request-list'),
    path('cuti/create/', CutiCreateView.as_view(), name='cuti-create'),
    path('mutasi/create/', MutasiCreateView.as_view(), name='mutasi-create'),
]