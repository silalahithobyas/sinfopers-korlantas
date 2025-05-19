from django.db import migrations
import uuid

def link_personil_to_user(apps, schema_editor):
    """
    Menambahkan user untuk personil yang tidak memiliki user terkait.
    Untuk setiap personil tanpa user, akan dibuat user baru dengan username berdasarkan NRP.
    """
    # Get models from apps registry to avoid import issues
    UserPersonil = apps.get_model('personnel_database', 'UserPersonil')
    AuthUser = apps.get_model('authentication', 'AuthUser')
    
    # Find all personil without users
    personil_tanpa_user = UserPersonil.objects.filter(user__isnull=True)
    
    # Log information
    print(f"Found {personil_tanpa_user.count()} personil without linked users")
    
    for personil in personil_tanpa_user:
        # Generate username based on NRP
        username = f"user_{personil.nrp}"
        
        # Make sure the username is unique
        counter = 1
        base_username = username
        while AuthUser.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1
        
        # Create a new user
        try:
            user = AuthUser.objects.create(
                username=username,
                # Default as anggota
                role="anggota",
                is_active=True,
                # Use make_password manually if needed
                # password is random but users can't login with it anyway without knowing
                password=f"pbkdf2_sha256$600000${uuid.uuid4().hex}"
            )
            
            # Link the user to personil
            personil.user = user
            personil.save()
            
            print(f"Created user {username} for personil {personil.nama} (NRP: {personil.nrp})")
        except Exception as e:
            print(f"Error creating user for personil {personil.nama} (NRP: {personil.nrp}): {str(e)}")

def reverse_func(apps, schema_editor):
    """
    Tidak melakukan apa-apa saat rollback migrasi.
    User yang telah dibuat tetap ada, namun personil akan terlepas dari user.
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('personnel_database', '0001_initial'),  # Sesuaikan dengan migrasi terakhir Anda
    ]

    operations = [
        migrations.RunPython(link_personil_to_user, reverse_func),
    ] 