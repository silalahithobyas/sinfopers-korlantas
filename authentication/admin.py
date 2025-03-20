from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from authentication.models import AuthUser


class CustomUserAdmin(UserAdmin):
    model = AuthUser
    list_display = ('username','is_staff', 'is_active', 'email')
    list_filter = ('is_staff', 'is_active',)
    fieldsets = (
        (None, {'fields': ('email', 'username',)}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'is_staff', 'is_active')}
         ),
    )
    search_fields = ('username',)

admin.site.register(AuthUser, CustomUserAdmin)

admin.site.site_header = "Backend"
admin.site.site_title = "Sibinkar Admin"
admin.site.index_title = "Sibinkar Admin"
