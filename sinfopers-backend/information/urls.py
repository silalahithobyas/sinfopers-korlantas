from django.urls import path
from .views import InformationListCreateView, InformationDetailView, InformationLogListView

urlpatterns = [
    path('information/', InformationListCreateView.as_view()),
    path('information/<uuid:pk>/', InformationDetailView.as_view()),
    path('information/<uuid:information_id>/logs/', InformationLogListView.as_view()),  # ⬅ API log
]
