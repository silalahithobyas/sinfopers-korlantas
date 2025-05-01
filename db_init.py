#!/usr/bin/env python
"""
Script untuk membuat pengguna default dalam aplikasi SINFOPERS.
Jalankan dengan: python db_init.py
"""

import os
import django

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Setelah Django diinisialisasi, baru impor model
from authentication.models import AuthUser
from django.db import transaction

# Buat daftar user yang akan ditambahkan
users_data = [
    {
        'username': 'admin',
        'password': 'admin123',
        'role': 'admin',
        'is_superuser': True,
        'is_staff': True,
    },
    {
        'username': 'anggota',
        'password': 'anggota123',
        'role': 'anggota',
    },
    {
        'username': 'user_hr',
        'password': 'user_hr123',
        'role': 'hr',
    },
    {
        'username': 'pimpinan',
        'password': 'pimpinan123',
        'role': 'pimpinan',
    },
    {
        'username': 'admin2',
        'password': 'admin123',
        'role': 'admin',
        'is_superuser': True,
        'is_staff': True,
    },
    {
        'username': 'anggota2',
        'password': 'anggota123',
        'role': 'anggota',
    },
    {
        'username': 'user_hr2',
        'password': 'user_hr123',
        'role': 'hr',
    },
    {
        'username': 'pimpinan2',
        'password': 'pimpinan123',
        'role': 'pimpinan',
    },
]

def create_users():
    """
    Fungsi untuk membuat user dalam database
    """
    print("=== Mulai membuat pengguna ===")
    
    with transaction.atomic():
        for user_data in users_data:
            username = user_data['username']
            # Cek apakah user sudah ada
            if AuthUser.objects.filter(username=username).exists():
                print(f"User {username} sudah ada, dilewati")
                continue
                
            # Buat user baru
            user = AuthUser.objects.create_user(
                username=username,
                password=user_data['password'],
                role=user_data['role']
            )
            
            # Set superuser & staff jika diperlukan
            if user_data.get('is_superuser', False):
                user.is_superuser = True
            if user_data.get('is_staff', False):
                user.is_staff = True
                
            user.save()
            print(f"User {username} berhasil dibuat dengan role {user_data['role']}")
    
    print("=== Pengguna berhasil dibuat ===")
    print("\nCredentials:")
    for user in users_data:
        print(f"Username: {user['username']}")
        print(f"Password: {user['password']}")
        print(f"Role: {user['role']}")
        print("---")

if __name__ == "__main__":
    create_users()
else:
    # Ketika diimpor sebagai modul dalam shell Django
    create_users() 