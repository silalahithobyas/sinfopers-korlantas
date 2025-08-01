
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView


from person_detail import views

urlpatterns = [
    path('data/', views.get_user_from_token, name='person-detail-data'),
]
