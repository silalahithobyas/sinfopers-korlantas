from django.contrib import admin
from .models import Permohonan

@admin.register(Permohonan)
class PermohonanAdmin(admin.ModelAdmin):
    list_display = ('personel', 'jenis_permohonan', 'status', 'date_created')
    list_filter = ('jenis_permohonan', 'status')
    search_fields = ('personel__username', 'alasan')
    readonly_fields = ('date_created', 'date_updated')
    fieldsets = (
        (None, {
            'fields': ('personel', 'jenis_permohonan', 'alasan', 'file_pendukung')
        }),
        ('Status', {
            'fields': ('status', 'catatan_hr', 'catatan_pimpinan')
        }),
        ('Timestamps', {
            'fields': ('date_created', 'date_updated')
        }),
    )
