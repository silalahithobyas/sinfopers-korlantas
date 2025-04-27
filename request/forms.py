from django.forms import ModelForm
from request.models import CutiRequest

class CutiRequestForm(ModelForm):
    class Meta:
        model = CutiRequest
        fields = ["tanggalMulai", "tanggalSelesai", "alasan"]