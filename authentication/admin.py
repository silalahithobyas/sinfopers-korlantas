# Update authentication/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from authentication.models import AuthUser


class CustomUserAdmin(UserAdmin):
    model = AuthUser
    list_display = ('username', 'role', 'is_staff', 'is_active', 'email')
    list_filter = ('role', 'is_staff', 'is_active',)
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Role', {'fields': ('role',)}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'is_staff', 'is_active')}
         ),
    )
    search_fields = ('username', 'email')
    ordering = ('username',)

admin.site.register(AuthUser, CustomUserAdmin)

admin.site.site_header = "Backend"
admin.site.site_title = "Sinfopers Admin"
admin.site.index_title = "Sinfopers Admin"