from rest_framework.permissions import BasePermission

class IsAdminOrHR(BasePermission):
    """
    Permission untuk memeriksa apakah user adalah admin atau HR
    """
    message = "Anda tidak memiliki hak akses untuk melakukan tindakan ini."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.role in ['admin', 'hr'] 