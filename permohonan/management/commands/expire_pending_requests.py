from django.core.management.base import BaseCommand
from django.utils import timezone
from permohonan.models import Permohonan
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Otomatis mengubah status permohonan yang sudah lebih dari 7 hari tanpa respon HR menjadi TIDAK_VALID'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Hanya menampilkan permohonan yang akan di-expire tanpa mengubah status',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Menampilkan informasi detail',
        )

    def handle(self, *args, **options):
        """
        Main function untuk menjalankan auto-expire
        """
        dry_run = options['dry_run']
        verbose = options['verbose']
        
        if verbose:
            self.stdout.write(
                self.style.SUCCESS('Memulai proses auto-expire permohonan...')
            )
        
        if dry_run:
            # Mode dry-run: hanya menampilkan permohonan yang akan di-expire
            from datetime import timedelta
            cutoff_date = timezone.now() - timedelta(days=7)
            
            expired_requests = Permohonan.objects.filter(
                status=Permohonan.StatusPermohonan.PENDING_HR,
                date_created__lte=cutoff_date
            )
            
            count = expired_requests.count()
            
            self.stdout.write(
                self.style.WARNING(f'[DRY RUN] Ditemukan {count} permohonan yang akan di-expire')
            )
            
            if verbose and count > 0:
                self.stdout.write(self.style.WARNING('Detail permohonan:'))
                for req in expired_requests:
                    days_old = (timezone.now() - req.date_created).days
                    self.stdout.write(
                        f'- ID: {req.id}, User: {req.personel.username}, '
                        f'Jenis: {req.jenis_permohonan}, Dibuat: {req.date_created}, '
                        f'Umur: {days_old} hari'
                    )
        else:
            # Mode actual: jalankan auto-expire
            try:
                expired_count = Permohonan.auto_expire_pending_requests()
                
                if expired_count > 0:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Berhasil mengubah status {expired_count} permohonan menjadi TIDAK_VALID'
                        )
                    )
                    logger.info(f'Management command expired {expired_count} pending requests')
                else:
                    self.stdout.write(
                        self.style.SUCCESS('Tidak ada permohonan yang perlu di-expire')
                    )
                    
            except Exception as e:
                error_msg = f'Error saat menjalankan auto-expire: {str(e)}'
                self.stdout.write(self.style.ERROR(error_msg))
                logger.error(error_msg)
                raise e
        
        if verbose:
            self.stdout.write(
                self.style.SUCCESS('Proses auto-expire selesai.')
            ) 