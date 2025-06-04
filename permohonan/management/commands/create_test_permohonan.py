from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from permohonan.models import Permohonan
from authentication.models import AuthUser
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Membuat permohonan dengan tanggal tertentu untuk testing auto-expire'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-ago',
            type=int,
            default=8,
            help='Jumlah hari yang lalu untuk tanggal pembuatan permohonan (default: 8)',
        )
        parser.add_argument(
            '--count',
            type=int,
            default=1,
            help='Jumlah permohonan yang akan dibuat (default: 1)',
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Username pengguna yang akan membuat permohonan (opsional)',
        )

    def handle(self, *args, **options):
        """
        Main function untuk membuat test permohonan
        """
        days_ago = options['days_ago']
        count = options['count']
        username = options['username']
        
        # Tentukan tanggal pembuatan
        test_date = timezone.now() - timedelta(days=days_ago)
        
        # Cari user untuk membuat permohonan
        if username:
            try:
                user = AuthUser.objects.get(username=username)
            except AuthUser.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User dengan username "{username}" tidak ditemukan')
                )
                return
        else:
            # Gunakan user pertama yang ditemukan dengan role anggota
            try:
                user = AuthUser.objects.filter(role=AuthUser.ANGGOTA).first()
                if not user:
                    user = AuthUser.objects.first()
                if not user:
                    self.stdout.write(
                        self.style.ERROR('Tidak ada user yang tersedia di database')
                    )
                    return
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error saat mencari user: {str(e)}')
                )
                return
        
        self.stdout.write(
            self.style.SUCCESS(f'Akan membuat {count} permohonan dengan tanggal {test_date.strftime("%Y-%m-%d %H:%M:%S")} ({days_ago} hari yang lalu)')
        )
        self.stdout.write(f'User: {user.username}')
        
        created_count = 0
        for i in range(count):
            try:
                # Buat permohonan
                permohonan = Permohonan.objects.create(
                    personel=user,
                    jenis_permohonan=Permohonan.JenisPermohonan.CUTI,
                    alasan=f'Test permohonan untuk auto-expire #{i+1}',
                    status=Permohonan.StatusPermohonan.PENDING_HR
                )
                
                # Update tanggal pembuatan secara manual
                permohonan.date_created = test_date
                permohonan.save()
                
                created_count += 1
                
                # Tampilkan info permohonan
                days_since = (timezone.now() - permohonan.date_created).days
                is_expired = permohonan.is_expired()
                
                self.stdout.write(
                    f'✓ Permohonan #{i+1} dibuat (ID: {permohonan.id})'
                )
                self.stdout.write(
                    f'  - Umur: {days_since} hari'
                )
                self.stdout.write(
                    f'  - Status: {"🔴 KADALUARSA" if is_expired else "✅ BELUM KADALUARSA"}'
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error membuat permohonan #{i+1}: {str(e)}')
                )
        
        if created_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'\n✅ Berhasil membuat {created_count} permohonan test')
            )
            self.stdout.write(
                'Sekarang Anda bisa test auto-expire dengan:'
            )
            self.stdout.write(
                '1. Akses halaman permohonan di frontend'
            )
            self.stdout.write(
                '2. Atau jalankan: python manage.py expire_pending_requests'
            )
        else:
            self.stdout.write(
                self.style.ERROR('Tidak ada permohonan yang berhasil dibuat')
            ) 