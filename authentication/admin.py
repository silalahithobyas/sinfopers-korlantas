# Update authentication/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib import messages

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

    def save_model(self, request, obj, form, change):
        """
        Override untuk memberikan hak istimewa pada admin.
        """
        # Izinkan admin dan superuser untuk membuat/mengubah role menjadi admin
        is_admin_or_superuser = request.user.is_superuser or request.user.role == 'admin'

        # Jika pengguna bukan admin atau superuser dan mencoba mengubah role menjadi admin
        if not is_admin_or_superuser and 'role' in form.changed_data and obj.role == 'admin':
            messages.error(request, "Hanya admin dan superuser yang dapat mengangkat admin baru.")
            obj.role = AuthUser.objects.get(pk=obj.pk).role if obj.pk else 'anggota'

        # Jika user mencoba mengaktifkan is_superuser tapi bukan superuser
        if not request.user.is_superuser and 'is_superuser' in form.changed_data and obj.is_superuser:
            messages.error(request, "Hanya superuser yang dapat mengangkat superuser baru.")
            obj.is_superuser = False

        super().save_model(request, obj, form, change)

    def get_readonly_fields(self, request, obj=None):
        """
        Tentukan fields yang hanya bisa dibaca berdasarkan hak akses
        """
        readonly_fields = super().get_readonly_fields(request, obj)

        # Jika bukan superuser, is_superuser harus read-only
        if not request.user.is_superuser:
            readonly_fields = list(readonly_fields) + ['is_superuser']

        # Jika bukan admin atau superuser, admin fields juga read-only
        if not (request.user.is_superuser or request.user.role == 'admin'):
            if obj and obj.role == 'admin':
                readonly_fields = list(readonly_fields) + ['role']

        return readonly_fields

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        """
        Batasi pilihan role berdasarkan hak akses
        """
        if db_field.name == 'role' and not (request.user.is_superuser or request.user.role == 'admin'):
            # Hanya admin dan superuser yang dapat memilih role 'admin'
            kwargs['choices'] = [choice for choice in db_field.choices if choice[0] != 'admin']

        return super().formfield_for_choice_field(db_field, request, **kwargs)

    def get_queryset(self, request):
        """
        Filter queryset - non-superuser tidak dapat melihat superuser
        """
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(is_superuser=False)
        return qs


admin.site.register(AuthUser, CustomUserAdmin)

admin.site.site_header = "Backend"
admin.site.site_title = "Sinfopers Admin"
admin.site.index_title = "Sinfopers Admin"