from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),  # Sesuaikan dengan migrasi terakhir AuthUser
        ('personnel_database', '0002_link_personil_to_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userpersonil',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='personil', to='authentication.authuser'),
        ),
    ] 