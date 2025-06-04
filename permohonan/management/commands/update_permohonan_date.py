from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from permohonan.models import Permohonan
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Mengubah tanggal pembuatan permohonan yang sudah ada untuk testing auto-expire'

    def add_arguments(self, parser):
        parser.add_argument(
            '--permohonan-id',
            type=str,
            help='ID spesifik permohonan yang akan diubah',
        )
        parser.add_argument(
            '--days-ago',
            type=int,
            default=8,
            help='Jumlah hari yang lalu untuk tanggal pembuatan (default: 8)',
        )
        parser.add_argument(
            '--status',
            type=str,
            default='pending_hr',
            help='Filter berdasarkan status permohonan (default: pending_hr)',
        )
        parser.add_argument(
            '--all-pending',
            action='store_true',
            help='Update semua permohonan dengan status pending_hr',
        )

    def handle(self, *args, **options):
        """
        Main function untuk mengubah tanggal permohonan
        """
        permohonan_id = options['permohonan_id']
        days_ago = options['days_ago']
        status_filter = options['status']
        all_pending = options['all_pending']
        
        # Tentukan tanggal baru
        new_date = timezone.now() - timedelta(days=days_ago)
        
        # Tentukan permohonan yang akan diupdate
        if permohonan_id:
            # Update permohonan spesifik
            try:
                permohonan = Permohonan.objects.get(id=permohonan_id)
                queryset = [permohonan]
                self.stdout.write(f'Target: Permohonan ID {permohonan_id}')
            except Permohonan.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Permohonan dengan ID {permohonan_id} tidak ditemukan')
                )
                return
        elif all_pending:
            # Update semua permohonan pending
            queryset = Permohonan.objects.filter(status=Permohonan.StatusPermohonan.PENDING_HR)
            self.stdout.write(f'Target: Semua permohonan dengan status pending_hr ({queryset.count()} permohonan)')
        else:
            # Update berdasarkan status
            queryset = Permohonan.objects.filter(status=status_filter)
            self.stdout.write(f'Target: Permohonan dengan status {status_filter} ({queryset.count()} permohonan)')
        
        if not queryset:
            self.stdout.write(
                self.style.WARNING('Tidak ada permohonan yang ditemukan untuk diupdate')
            )
            return
        
        self.stdout.write(
            self.style.SUCCESS(f'Akan mengubah tanggal menjadi: {new_date.strftime("%Y-%m-%d %H:%M:%S")} ({days_ago} hari yang lalu)')
        )
        
        # Konfirmasi
        if not permohonan_id:
            confirm = input('Lanjutkan? [y/N]: ')
            if confirm.lower() != 'y':
                self.stdout.write('Dibatalkan')
                return
        
        updated_count = 0
        for permohonan in queryset:
            try:
                old_date = permohonan.date_created
                permohonan.date_created = new_date
                permohonan.save()
                
                # Hitung info expire
                days_since = (timezone.now() - permohonan.date_created).days
                is_expired = permohonan.is_expired()
                
                self.stdout.write(
                    f'✓ Updated: {permohonan.id} - {permohonan.personel.username}'
                )
                self.stdout.write(
                    f'  - Tanggal lama: {old_date.strftime("%Y-%m-%d %H:%M:%S")}'
                )
                self.stdout.write(
                    f'  - Tanggal baru: {new_date.strftime("%Y-%m-%d %H:%M:%S")}'
                )
                self.stdout.write(
                    f'  - Umur: {days_since} hari'
                )
                self.stdout.write(
                    f'  - Status: {"🔴 KADALUARSA" if is_expired else "✅ BELUM KADALUARSA"}'
                )
                self.stdout.write('---')
                
                updated_count += 1
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error updating permohonan {permohonan.id}: {str(e)}')
                )
        
        if updated_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'\n✅ Berhasil mengupdate {updated_count} permohonan')
            )
            self.stdout.write(
                'Sekarang Anda bisa test auto-expire dengan:'
            )
            self.stdout.write(
                '1. python manage.py expire_pending_requests --dry-run'
            )
            self.stdout.write(
                '2. python manage.py expire_pending_requests'
            )
            self.stdout.write(
                '3. Akses halaman permohonan di frontend'
            )
        else:
            self.stdout.write(
                self.style.ERROR('Tidak ada permohonan yang berhasil diupdate')
            ) 