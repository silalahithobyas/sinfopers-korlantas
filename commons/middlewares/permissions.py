# Create this file as commons/middlewares/permissions.py

from functools import wraps
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Permission check for admin role.
    """
    def has_permission(self, request, view):
        return request.user and (request.user.is_admin or request.user.is_superuser)


class IsHR(BasePermission):
    """
    Permission check for HR role.
    """
    def has_permission(self, request, view):
        return request.user and (request.user.is_hr or request.user.is_admin or request.user.is_superuser)


class IsPimpinan(BasePermission):
    """
    Permission check for Pimpinan role.
    """
    def has_permission(self, request, view):
        return request.user and (request.user.is_pimpinan or request.user.is_admin or request.user.is_superuser)


class IsAnggota(BasePermission):
    """
    Permission check for Anggota role.
    """
    def has_permission(self, request, view):
        return request.user and (request.user.is_anggota or request.user.is_admin or request.user.is_superuser)


# Decorator for function-based views
def admin_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and (request.user.is_admin or request.user.is_superuser):
            return view_func(request, *args, **kwargs)
        raise PermissionDenied("Admin access required.")
    return wrapper


def hr_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and (request.user.is_hr or request.user.is_admin or request.user.is_superuser):
            return view_func(request, *args, **kwargs)
        raise PermissionDenied("HR access required.")
    return wrapper


def pimpinan_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and (request.user.is_pimpinan or request.user.is_admin or request.user.is_superuser):
            return view_func(request, *args, **kwargs)
        raise PermissionDenied("Pimpinan access required.")
    return wrapper


def anggota_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and (request.user.is_anggota or request.user.is_pimpinan or request.user.is_hr or request.user.is_admin or request.user.is_superuser):
            return view_func(request, *args, **kwargs)
        raise PermissionDenied("Authenticated access required.")
    return wrapper