import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLinkIcon } from "lucide-react";
import { getFileNameFromPath, openFileInNewTab } from "@/utils/fileHelper";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";

// Interface untuk data Permohonan
interface Permohonan {
    id: string;
    personel: string;
    personel_username: string;
    jenis_permohonan: string;
    jenis_permohonan_display: string;
    alasan: string;
    file_pendukung: string | null;
    status: string;
    status_display: string;
    catatan_hr: string | null;
    hr_reviewer: string | null;
    hr_reviewer_name: string | null;
    hr_review_date: string | null;
    catatan_pimpinan: string | null;
    pimpinan_reviewer: string | null;
    pimpinan_reviewer_name: string | null;
    pimpinan_review_date: string | null;
    date_created: string;
    date_updated: string;
}

interface PermohonanDetailProps {
    permohonan: Permohonan;
    onReview?: (permohonan: Permohonan) => void;
}

const InfoItem = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    
    return (
        <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700">{label}</h3>
            <p className="mt-1 text-sm text-gray-900">{value}</p>
        </div>
    );
};

const PermohonanDetail = ({ permohonan, onReview }: PermohonanDetailProps) => {
    const { role } = useAuth();
    const isPimpinan = role === UserRole.PIMPINAN;
    const isValidPermohonan = permohonan.status === 'valid';
    
    const statusColors = {
        pending_hr: "bg-yellow-100 text-yellow-800",
        valid: "bg-blue-100 text-blue-800",
        tidak_valid: "bg-red-100 text-red-800",
        disetujui: "bg-green-100 text-green-800",
        ditolak: "bg-red-100 text-red-800",
    };

    const statusStyle = statusColors[permohonan.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";

    const handleReview = () => {
        if (onReview) {
            onReview(permohonan);
        }
    };

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>
                    Detail Permohonan {permohonan.jenis_permohonan_display}
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
                <div className="border-b pb-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">
                            {permohonan.jenis_permohonan_display}
                        </h2>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle}`}>
                            {permohonan.status_display}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Diajukan pada: {new Date(permohonan.date_created).toLocaleDateString('id-ID')}
                    </p>
                </div>

                <div>
                    <InfoItem label="Diajukan oleh" value={permohonan.personel_username} />
                    <InfoItem label="Alasan" value={permohonan.alasan} />
                    
                    {permohonan.file_pendukung && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700">File Pendukung</h3>
                            <div className="mt-1 flex items-center gap-2">
                                <FileIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">
                                    {getFileNameFromPath(permohonan.file_pendukung)}
                                </span>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="ml-2 flex items-center gap-1"
                                    onClick={() => openFileInNewTab(permohonan.file_pendukung)}
                                >
                                    <ExternalLinkIcon className="w-3 h-3" />
                                    Lihat File
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    <InfoItem label="Catatan HR" value={permohonan.catatan_hr} />
                    <InfoItem label="Catatan Pimpinan" value={permohonan.catatan_pimpinan} />
                    
                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-sm font-medium text-gray-700">Riwayat Status</h3>
                        <div className="mt-2 space-y-2">
                            <div className="bg-gray-50 p-2 rounded-md text-sm">
                                <p className="font-medium">Permohonan Dibuat</p>
                                <p className="text-gray-500 text-xs">{new Date(permohonan.date_created).toLocaleString('id-ID')}</p>
                            </div>
                            
                            {permohonan.status !== 'pending_hr' && (
                                <div className={`${permohonan.status === 'tidak_valid' ? 'bg-red-50' : 'bg-gray-50'} p-2 rounded-md text-sm`}>
                                    <p className={`font-medium ${permohonan.status === 'tidak_valid' ? 'text-red-800' : ''}`}>
                                        {permohonan.status === 'tidak_valid' ? 'Ditolak oleh HR' : 'Review oleh HR'}
                                    </p>
                                    <p className={`text-xs ${permohonan.status === 'tidak_valid' ? 'text-red-600' : 'text-gray-500'}`}>{permohonan.catatan_hr || 'Tidak ada catatan'}</p>
                                </div>
                            )}
                            
                            {permohonan.status === 'valid' && (
                                <div className="bg-blue-50 p-2 rounded-md text-sm">
                                    <p className="font-medium text-blue-800">Divalidasi oleh HR</p>
                                    <p className="text-blue-600 text-xs">Menunggu persetujuan pimpinan</p>
                                </div>
                            )}
                            
                            {(permohonan.status === 'disetujui' || permohonan.status === 'ditolak') && (
                                <div className="bg-gray-50 p-2 rounded-md text-sm">
                                    <p className="font-medium">Review oleh Pimpinan</p>
                                    <p className="text-gray-500 text-xs">{permohonan.catatan_pimpinan || 'Tidak ada catatan'}</p>
                                </div>
                            )}
                            
                            {permohonan.status === 'disetujui' && (
                                <div className="bg-green-50 p-2 rounded-md text-sm">
                                    <p className="font-medium text-green-800">Permohonan Disetujui</p>
                                    <p className="text-green-600 text-xs">{new Date(permohonan.date_updated).toLocaleString('id-ID')}</p>
                                </div>
                            )}
                            
                            {permohonan.status === 'ditolak' && (
                                <div className="bg-red-50 p-2 rounded-md text-sm">
                                    <p className="font-medium text-red-800">Permohonan Ditolak</p>
                                    <p className="text-red-600 text-xs">{new Date(permohonan.date_updated).toLocaleString('id-ID')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {isPimpinan && isValidPermohonan && onReview && (
                <DialogFooter className="mt-6">
                    <Button 
                        variant="default"
                        onClick={handleReview}
                        className="w-full"
                    >
                        Proses Permohonan
                    </Button>
                </DialogFooter>
            )}
        </DialogContent>
    );
};

export default PermohonanDetail; 