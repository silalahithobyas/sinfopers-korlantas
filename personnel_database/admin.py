from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count

from personnel_database.models.pangkat import Pangkat
from personnel_database.models.subdit import SubDit
from personnel_database.models.subsatker import SubSatKer
from personnel_database.models.jabatan import Jabatan
from personnel_database.models.users import UserPersonil


@admin.register(Pangkat)
class PangkatAdmin(admin.ModelAdmin):
    list_display = ('nama', 'tipe', 'jumlah_personil')
    list_filter = ('tipe',)
    search_fields = ('nama',)
    ordering = ('tipe', 'nama')
    fieldsets = (
        ('Informasi Pangkat', {
            'fields': ('nama', 'tipe')
        }),
    )
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            personil_count=Count('userpersonil')
        )
        return queryset
    
    def jumlah_personil(self, obj):
        count = getattr(obj, 'personil_count', 0)
        url = f"/backend/admin/personnel_database/userpersonil/?pangkat__id__exact={obj.id}"
        return format_html('<a href="{}">{} personil</a>', url, count)
    
    jumlah_personil.short_description = 'Jumlah Personil'
    jumlah_personil.admin_order_field = 'personil_count'


@admin.register(SubDit)
class SubDitAdmin(admin.ModelAdmin):
    list_display = ('nama', 'jumlah_personil')
    search_fields = ('nama',)
    ordering = ('nama',)
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            personil_count=Count('userpersonil')
        )
        return queryset
    
    def jumlah_personil(self, obj):
        count = getattr(obj, 'personil_count', 0)
        url = f"/backend/admin/personnel_database/userpersonil/?subdit__id__exact={obj.id}"
        return format_html('<a href="{}">{} personil</a>', url, count)
    
    jumlah_personil.short_description = 'Jumlah Personil'
    jumlah_personil.admin_order_field = 'personil_count'


@admin.register(SubSatKer)
class SubSatKerAdmin(admin.ModelAdmin):
    list_display = ('nama', 'jumlah_personil')
    search_fields = ('nama',)
    ordering = ('nama',)
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            personil_count=Count('userpersonil')
        )
        return queryset
    
    def jumlah_personil(self, obj):
        count = getattr(obj, 'personil_count', 0)
        url = f"/backend/admin/personnel_database/userpersonil/?subsatker__id__exact={obj.id}"
        return format_html('<a href="{}">{} personil</a>', url, count)
    
    jumlah_personil.short_description = 'Jumlah Personil'
    jumlah_personil.admin_order_field = 'personil_count'


@admin.register(Jabatan)
class JabatanAdmin(admin.ModelAdmin):
    list_display = ('nama', 'jumlah_personil')
    search_fields = ('nama',)
    ordering = ('nama',)
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            personil_count=Count('userpersonil')
        )
        return queryset
    
    def jumlah_personil(self, obj):
        count = getattr(obj, 'personil_count', 0)
        url = f"/backend/admin/personnel_database/userpersonil/?jabatan__id__exact={obj.id}"
        return format_html('<a href="{}">{} personil</a>', url, count)
    
    jumlah_personil.short_description = 'Jumlah Personil'
    jumlah_personil.admin_order_field = 'personil_count'


@admin.register(UserPersonil)
class UserPersonilAdmin(admin.ModelAdmin):
    list_display = ('nama', 'nrp', 'pangkat', 'jabatan', 'subsatker', 'subdit', 'status', 'jenis_kelamin', 'bko', 'terhubung_dengan_user')
    list_filter = ('status', 'jenis_kelamin', 'bko', 'pangkat', 'subsatker', 'subdit')
    search_fields = ('nama', 'nrp', 'user__username')
    ordering = ('-updated_at',)
    
    fieldsets = (
        ('Informasi Utama', {
            'fields': ('nama', 'nrp', 'jenis_kelamin')
        }),
        ('Pangkat dan Jabatan', {
            'fields': ('pangkat', 'jabatan')
        }),
        ('Unit Kerja', {
            'fields': ('subsatker', 'subdit', 'bko')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Relasi User', {
            'fields': ('user',),
            'description': 'Hubungkan personil dengan akun pengguna yang sudah terdaftar'
        }),
    )
    
    def terhubung_dengan_user(self, obj):
        if obj.user:
            return format_html(
                '<span style="color:green;">✓</span> <a href="/backend/admin/authentication/authuser/{}/change/">{}</a>',
                obj.user.id,
                obj.user.username
            )
        return format_html('<span style="color:red;">✗</span> Belum terhubung')
    
    terhubung_dengan_user.short_description = 'User'
