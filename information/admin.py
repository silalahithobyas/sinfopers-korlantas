from django.contrib import admin
from .models import Information, InformationLog

# Register your models here.
class InformationLogInline(admin.TabularInline):
    model = InformationLog
    extra = 0
    readonly_fields = ['user', 'action', 'timestamp', 'detail']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Information)
class InformationAdmin(admin.ModelAdmin):
    list_display = ['information_title', 'penulis', 'date_created', 'date_updated']
    list_filter = ['date_created', 'date_updated']
    search_fields = ['information_title', 'penulis__username', 'information_context']
    readonly_fields = ['date_created', 'date_updated']
    inlines = [InformationLogInline]

@admin.register(InformationLog)
class InformationLogAdmin(admin.ModelAdmin):
    list_display = ['information', 'user', 'action', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['information__information_title', 'user__username', 'detail']
    readonly_fields = ['information', 'user', 'action', 'timestamp', 'detail']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
