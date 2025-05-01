from django.db import models  # Pastikan ini diimport
from ..models.cuti import CutiRequest
from ..models.mutasi import MutasiRequest

class RequestService:
    @staticmethod
    def get_combined_requests(user):
        # Query untuk cuti
        cuti_requests = CutiRequest.objects.filter(user=user).values(
            'id',
            'tanggal_pengajuan',
            'status'
        )
        for req in cuti_requests:
            req['jenis'] = 'cuti'
            req['tanggal'] = req.pop('tanggal_pengajuan')
        
        # Query untuk mutasi
        mutasi_requests = MutasiRequest.objects.filter(user=user).values(
            'id',
            'tanggal_pengajuan',
            'status'
        )
        for req in cuti_requests:
            req['jenis'] = 'cuti'
            req['tanggal'] = req.pop('tanggal_pengajuan')
        
        # Gabungkan dan urutkan
        combined = list(cuti_requests) + list(mutasi_requests)
        return sorted(combined, key=lambda x: x['tanggal'], reverse=True)