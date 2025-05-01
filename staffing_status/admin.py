from django.contrib import admin
from django.utils.html import format_html
from django import forms
from staffing_status.models import StaffingStatus

class StaffingStatusForm(forms.ModelForm):
    class Meta:
        model = StaffingStatus
        fields = '__all__'
        help_texts = {
            'nama': 'Nama status kepegawaian (misalnya: "Status Pangkat Akpol", "Bidang Humas")',
            'subsatker': 'Pilih sub-satuan kerja terkait',
            'pangkat': 'Pilih pangkat terkait (bisa memilih lebih dari satu)',
        }
        widgets = {
            'pangkat': forms.SelectMultiple(attrs={'size': '5'}),
        }

class StaffingStatusAdmin(admin.ModelAdmin):
    form = StaffingStatusForm
    list_display = ('nama', 'subsatker', 'get_pangkat', 'dsp', 'rill', 'status_kepegawaian')
    search_fields = ('nama', 'subsatker__nama')
    list_filter = ('subsatker', 'pangkat')
    
    fieldsets = (
        ('Informasi Umum', {
            'fields': ('nama', 'subsatker', 'pangkat'),
            'description': 'Informasi dasar tentang status kepegawaian'
        }),
        ('Jumlah Personel', {
            'fields': ('dsp', 'rill'),
            'description': format_html(
                '<div style="margin-bottom:10px;">'
                '<p><strong>DSP (Daftar Susunan Personel)</strong>: Jumlah personel yang seharusnya/idealnya mengisi posisi ini.</p>'
                '<p><strong>Riil</strong>: Jumlah personel aktual yang saat ini mengisi posisi ini.</p>'
                '<p style="color:#666;"><i>Catatan: Nilai Riil akan bertambah otomatis saat personel baru ditambahkan dan berkurang '
                'saat personel dihapus dari sistem dengan kombinasi pangkat dan subsatker yang sama.</i></p>'
                '</div>'
            )
        }),
    )
    
    def get_pangkat(self, obj):
        return ", ".join([p.nama for p in obj.pangkat.all()])
    get_pangkat.short_description = 'Pangkat'
    
    def status_kepegawaian(self, obj):
        if obj.dsp > obj.rill:
            return format_html('<span style="color:red;">Kekurangan {} personel</span>', obj.dsp - obj.rill)
        elif obj.dsp < obj.rill:
            return format_html('<span style="color:orange;">Kelebihan {} personel</span>', obj.rill - obj.dsp)
        else:
            return format_html('<span style="color:green;">Sudah terpenuhi</span>')
    status_kepegawaian.short_description = 'Status'
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not change:  # Jika ini adalah data baru
            self.message_user(
                request, 
                format_html(
                    'Status kepegawaian berhasil dibuat.<br/>'
                    '<strong>Catatan penting:</strong> Sekarang personel dengan pangkat {} dan subsatker {} '
                    'dapat ditambahkan ke sistem.', 
                    ', '.join([p.nama for p in obj.pangkat.all()]), 
                    obj.subsatker.nama
                )
            )

admin.site.register(StaffingStatus, StaffingStatusAdmin)