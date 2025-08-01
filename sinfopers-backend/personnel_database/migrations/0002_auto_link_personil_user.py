from django.db import migrations, models
from django.contrib.auth.models import User
import uuid
import logging

logger = logging.getLogger('general')

def link_personil_to_new_users(apps, schema_editor):
    """
    Fungsi untuk menautkan personil yang belum memiliki user ke user baru otomatis.
    Ini memastikan bahwa semua personil memiliki user sebelum field user menjadi non-nullable.
    """
    # Ambil model dari apps registry untuk menghindari masalah import langsung
    UserPersonil = apps.get_model('personnel_database', 'UserPersonil')
    AuthUser = apps.get_model('authentication', 'AuthUser')
    
    # Ambil semua personil yang belum memiliki user
    unlinked_personils = UserPersonil.objects.filter(user__isnull=True)
    count = unlinked_personils.count()
    
    logger.info(f"Ditemukan {count} personil tanpa user. Membuat user otomatis...")
    
    for personil in unlinked_personils:
        try:
            # Buat username unik dari nama personil dan NRP
            username = f"{personil.nama.replace(' ', '_').lower()}_{personil.nrp}"
            username = username[:30]  # Batasi panjang username
            
            # Cek apakah username sudah digunakan, tambahkan angka random jika sudah
            if AuthUser.objects.filter(username=username).exists():
                random_suffix = str(uuid.uuid4())[:8]
                username = f"{username[:22]}_{random_suffix}"
            
            # Buat user baru dengan password acak
            # Password defaultnya adalah "ChangeMe123!" yang harus diganti saat login pertama
            new_user = AuthUser.objects.create(
                username=username,
                email=f"{username}@autogen.sinfopers.id",
                role="PERSONIL"
            )
            
            # Set password acak yang aman
            new_user.set_password("ChangeMe123!")
            new_user.save()
            
            # Hubungkan user ke personil
            personil.user = new_user
            personil.save()
            
            logger.info(f"Berhasil membuat user {username} untuk personil {personil.nama}")
        
        except Exception as e:
            logger.error(f"Gagal membuat user untuk personil {personil.id}: {str(e)}")


class Migration(migrations.Migration):

    dependencies = [
        ('personnel_database', '0001_initial'),
    ]

    operations = [
        # Jalankan fungsi migrasi untuk membuat user untuk semua personil yang belum punya user
        migrations.RunPython(link_personil_to_new_users),
        
        # Ubah field user menjadi non-nullable setelah semua personil memiliki user
        migrations.AlterField(
            model_name='userpersonil',
            name='user',
            field=models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='personil', to='authentication.authuser'),
        ),
    ] 