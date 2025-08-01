from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrHR(BasePermission):
    """
    Permission untuk memeriksa apakah user adalah admin atau HR
    """
    message = "Anda tidak memiliki hak akses untuk melakukan tindakan ini."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role in ['admin', 'hr']

class IsAdmin(BasePermission):
    """
    Permission untuk memeriksa apakah user adalah admin
    """
    message = "Hanya Admin yang memiliki hak akses untuk melakukan tindakan ini."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role == 'admin' 

class IsHRorReadOnly(BasePermission):
    """
    Hanya user dengan role HR yang boleh melakukan create/update/delete.
    Role lain hanya bisa melihat (GET/HEAD/OPTIONS).
    """
    message = "Hanya HR yang dapat menulis atau mengubah informasi."

    def has_permission(self, request, view):
        # Untuk metode read-only, izinkan siapa pun yang login
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Untuk create/update/delete, hanya HR yang boleh
        return request.user and request.user.is_authenticated and request.user.role == 'hr'

class IsHROwnerOrReadOnly(BasePermission):
    """
    Hanya HR yang boleh mengubah/menghapus informasi yang dia tulis sendiri.
    Semua user bisa melihat (read-only).
    """

    message = "Hanya HR yang menulis informasi ini yang dapat mengubah atau menghapusnya."

    def has_object_permission(self, request, view, obj):
        # Read-only (GET, HEAD, OPTIONS) => selalu boleh
        if request.method in SAFE_METHODS:
            return True

        # Hanya HR yang boleh melakukan perubahan pada miliknya
        return (
            request.user.is_authenticated
            and request.user.role == 'hr'
            and obj.penulis == request.user
        )