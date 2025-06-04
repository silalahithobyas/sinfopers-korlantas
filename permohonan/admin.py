from django.contrib import admin
from django import forms
from django.utils import timezone
from .models import Permohonan

@admin.register(Permohonan)
class PermohonanAdmin(admin.ModelAdmin):
    list_display = ('personel', 'jenis_permohonan', 'status', 'date_created', 'days_since_created', 'is_expired_display')
    list_filter = ('jenis_permohonan', 'status', 'date_created')
    search_fields = ('personel__username', 'alasan')
    readonly_fields = ('date_created', 'date_updated', 'days_since_created', 'is_expired_display')
    
    fieldsets = (
        (None, {
            'fields': ('personel', 'jenis_permohonan', 'alasan', 'file_pendukung')
        }),
        ('Status', {
            'fields': ('status', 'catatan_hr', 'catatan_pimpinan')
        }),
        ('Timestamps (Read-Only)', {
            'fields': ('date_created', 'date_updated', 'days_since_created', 'is_expired_display'),
            'description': 'Gunakan Admin Actions di bawah untuk mengubah tanggal untuk testing'
        }),
        ('Reviewer Info', {
            'fields': ('hr_reviewer', 'hr_review_date', 'pimpinan_reviewer', 'pimpinan_review_date'),
            'classes': ('collapse',)
        }),
    )
    
    def days_since_created(self, obj):
        """Menampilkan jumlah hari sejak permohonan dibuat"""
        return obj.days_since_created
    days_since_created.short_description = 'Umur (hari)'
    
    def is_expired_display(self, obj):
        """Menampilkan status kadaluarsa"""
        if obj.is_expired():
            return "🔴 KADALUARSA"
        elif obj.status == 'pending_hr':
            days_left = 7 - obj.days_since_created
            if days_left <= 2:
                return f"🟠 {days_left} hari lagi"
            elif days_left <= 5:
                return f"🟡 {days_left} hari lagi"
            else:
                return f"✅ {days_left} hari lagi"
        return "-"
    is_expired_display.short_description = 'Status Expire'
    
    actions = [
        'make_old_8_days', 
        'make_old_6_days', 
        'make_old_3_days', 
        'make_old_1_day',
        'run_auto_expire',
        'reset_to_today'
    ]
    
    def make_old_8_days(self, request, queryset):
        """Action untuk membuat permohonan menjadi 8 hari yang lalu (KADALUARSA)"""
        from datetime import timedelta
        old_date = timezone.now() - timedelta(days=8)
        updated_count = self._update_dates(queryset, old_date)
        self.message_user(request, f'{updated_count} permohonan diset menjadi 8 hari lalu (KADALUARSA)')
    make_old_8_days.short_description = "🔴 Set tanggal 8 hari lalu (KADALUARSA)"
    
    def make_old_6_days(self, request, queryset):
        """Action untuk membuat permohonan menjadi 6 hari yang lalu (1 hari lagi)"""
        from datetime import timedelta
        old_date = timezone.now() - timedelta(days=6)
        updated_count = self._update_dates(queryset, old_date)
        self.message_user(request, f'{updated_count} permohonan diset menjadi 6 hari lalu (1 hari lagi)')
    make_old_6_days.short_description = "🟠 Set tanggal 6 hari lalu (1 hari lagi)"
    
    def make_old_3_days(self, request, queryset):
        """Action untuk membuat permohonan menjadi 3 hari yang lalu (4 hari lagi)"""
        from datetime import timedelta
        old_date = timezone.now() - timedelta(days=3)
        updated_count = self._update_dates(queryset, old_date)
        self.message_user(request, f'{updated_count} permohonan diset menjadi 3 hari lalu (4 hari lagi)')
    make_old_3_days.short_description = "🟡 Set tanggal 3 hari lalu (4 hari lagi)"
    
    def make_old_1_day(self, request, queryset):
        """Action untuk membuat permohonan menjadi 1 hari yang lalu (6 hari lagi)"""
        from datetime import timedelta
        old_date = timezone.now() - timedelta(days=1)
        updated_count = self._update_dates(queryset, old_date)
        self.message_user(request, f'{updated_count} permohonan diset menjadi 1 hari lalu (6 hari lagi)')
    make_old_1_day.short_description = "✅ Set tanggal 1 hari lalu (6 hari lagi)"
    
    def reset_to_today(self, request, queryset):
        """Action untuk reset tanggal ke hari ini"""
        current_date = timezone.now()
        updated_count = self._update_dates(queryset, current_date)
        self.message_user(request, f'{updated_count} permohonan direset ke hari ini')
    reset_to_today.short_description = "🔄 Reset tanggal ke hari ini"
    
    def run_auto_expire(self, request, queryset):
        """Action untuk menjalankan auto-expire"""
        expired_count = Permohonan.auto_expire_pending_requests()
        self.message_user(request, f'Auto-expire dijalankan. {expired_count} permohonan berhasil di-expire')
    run_auto_expire.short_description = "⚡ Jalankan Auto-Expire"
    
    def _update_dates(self, queryset, new_date):
        """Helper method untuk update tanggal"""
        updated_count = 0
        for obj in queryset:
            obj.date_created = new_date
            obj.save()
            updated_count += 1
        return updated_count
