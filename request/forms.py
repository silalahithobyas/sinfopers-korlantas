from django.forms import ModelForm, DateInput, Textarea
from request.models import CutiRequest, MutasiRequest
from django.core.exceptions import ValidationError

class CutiRequestForm(ModelForm):
    class Meta:
        model = CutiRequest
        fields = ["tanggalMulai", "tanggalSelesai", "alasan"]
        widgets = {
            'tanggalMulai': DateInput(
                attrs={
                    'type': 'date',  # HTML5 date picker
                    'class': 'form-control',  # Bootstrap class (optional)
                    'placeholder': 'Pilih tanggal mulai cuti',
                }
            ),
            'tanggalSelesai': DateInput(
                attrs={
                    'type': 'date',
                    'class': 'form-control',
                    'placeholder': 'Pilih tanggal selesai cuti',
                }
            ),
            'alasan': Textarea(
                attrs={
                    'class': 'form-control',
                    'rows': 3,  # Default height
                    'placeholder': 'Masukkan alasan cuti...',
                }
            ),
        }

        def clean(self):
            cleaned_data = super().clean()
            tanggalMulai = cleaned_data.get('tanggalMulai')
            tanggalSelesai = cleaned_data.get('tanggalSelesai')

            if tanggalMulai and tanggalSelesai:
                if tanggalMulai > tanggalSelesai:
                    raise ValidationError("Tanggal selesai harus setelah tanggal mulai!")
            return cleaned_data

class MutasiRequestForm(ModelForm):
    class Meta:
        model = MutasiRequest
        fields = ['alamatBaru']
        widgets = {
            'alamatBaru': Textarea(
                attrs={
                    'class': 'form-control',
                    'rows': 3,
                    'placeholder': 'Masukkan alamat baru...',
                }
            ),
        }