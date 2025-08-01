import { useState, useEffect } from "react";
import { Navbar, NavbarPageEnum } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";
import { Plus, ClipboardCheck, Clock, AlertTriangle } from "lucide-react";
import axiosClient from "@/networks/apiClient";
import FooterCopyright from "@/components/FooterCopyright";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import CreatePermohonanDialog from "./components/CreatePermohonanDialog";
import ReviewPermohonanDialog from "./components/ReviewPermohonanDialog";
import PermohonanDetail from "./components/PermohonanDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

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
    is_expired?: boolean;
    days_since_created?: number;
}

const PermohonanPage = () => {
    const { role } = useAuth();
    const [permohonanList, setPermohonanList] = useState<Permohonan[]>([]);
    const [historyPermohonanList, setHistoryPermohonanList] = useState<Permohonan[]>([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedPermohonan, setSelectedPermohonan] = useState<Permohonan | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const isHR = role === UserRole.HR;
    const isPimpinan = role === UserRole.PIMPINAN;
    const isAnggota = role === UserRole.ANGGOTA;
    const isHRorPimpinan = isHR || isPimpinan;

    useEffect(() => {
        fetchPermohonan();
        if (isHRorPimpinan) {
            fetchHistoryPermohonan();
        }
    }, []);

    // Logika untuk menentukan tab default berdasarkan keberadaan data
    useEffect(() => {
        if (!loading && !historyLoading) {
            // Jika permohonan aktif kosong tapi ada history, set tab ke history
            if (permohonanList.length === 0 && historyPermohonanList.length > 0 && isHRorPimpinan) {
                setActiveTab("history");
            }
        }
    }, [loading, historyLoading, permohonanList.length, historyPermohonanList.length]);

    const fetchPermohonan = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get("/permohonan/");
            console.log("API Response:", response.data);
            
            // Periksa struktur respons dengan lebih fleksibel
            if (response.data) {
                if (response.data.success && Array.isArray(response.data.data)) {
                    // Format: { success: true, data: [...] }
                    setPermohonanList(response.data.data);
                } else if (Array.isArray(response.data)) {
                    // Format: [...] (array langsung)
                    setPermohonanList(response.data);
                } else if (response.data.results && Array.isArray(response.data.results)) {
                    // Format: { results: [...] }
                    setPermohonanList(response.data.results);
                } else {
                    console.error("Format respons tidak sesuai yang diharapkan:", response.data);
                    setPermohonanList([]);
                }
            } else {
                setPermohonanList([]);
            }
        } catch (error) {
            console.error("Error fetching permohonan:", error);
            setPermohonanList([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoryPermohonan = async () => {
        try {
            setHistoryLoading(true);
            const endpoint = isHR 
                ? '/permohonan/history/hr/' 
                : isPimpinan 
                    ? '/permohonan/history/pimpinan/' 
                    : null;
                    
            if (!endpoint) return;
            
            const response = await axiosClient.get(endpoint);
            // Handle jika response adalah array langsung atau nested di dalam data
            if (Array.isArray(response.data)) {
                setHistoryPermohonanList(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                setHistoryPermohonanList(response.data.data);
            } else if (response.data && Array.isArray(response.data.results)) {
                setHistoryPermohonanList(response.data.results);
            } else {
                console.warn("Format response history permohonan tidak dikenali:", response.data);
                setHistoryPermohonanList([]);
            }
        } catch (error) {
            console.error("Error fetching permohonan history:", error);
            toast({
                title: "Gagal memuat history permohonan",
                description: "Terjadi kesalahan saat memuat daftar history permohonan",
                variant: "destructive",
            });
            setHistoryPermohonanList([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleRefresh = () => {
        // Set loading state saat memulai refresh
        setLoading(true);
        if (isHRorPimpinan) {
            setHistoryLoading(true);
        }
        
        fetchPermohonan();
        if (isHRorPimpinan) {
            fetchHistoryPermohonan();
        }
    };

    const handleOpenReview = (permohonan: Permohonan) => {
        setSelectedPermohonan(permohonan);
        setIsReviewDialogOpen(true);
    };

    const handleOpenDetail = (permohonan: Permohonan) => {
        setSelectedPermohonan(permohonan);
        setIsDetailDialogOpen(true);
    };

    const canReview = (permohonan: Permohonan) => {
        return (
            (isHR && permohonan.status === 'pending_hr') ||
            (isPimpinan && permohonan.status === 'valid')
        );
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "pending_hr":
                return "bg-yellow-100 text-yellow-800";
            case "valid":
                return "bg-blue-100 text-blue-800";
            case "tidak_valid":
                return "bg-red-100 text-red-800";
            case "disetujui":
                return "bg-green-100 text-green-800";
            case "ditolak":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getExpiryIndicator = (permohonan: Permohonan) => {
        const daysLeft = 7 - (permohonan.days_since_created || 0);
        
        if (permohonan.status === 'pending_hr') {
            if (permohonan.is_expired) {
                return (
                    <div className="flex items-center text-red-600 text-xs mt-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Kadaluarsa
                    </div>
                );
            } else if (daysLeft <= 2) {
                return (
                    <div className="flex items-center text-orange-600 text-xs mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {daysLeft} hari lagi
                    </div>
                );
            } else if (daysLeft <= 5) {
                return (
                    <div className="flex items-center text-yellow-600 text-xs mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {daysLeft} hari lagi
                    </div>
                );
            }
        }
        
        return null;
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar page={NavbarPageEnum.permohonan} />
            <div className="container mx-auto py-8 flex-grow">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isAnggota
                            ? "Permohonan Saya"
                            : isHR
                            ? "Permohonan Yang Perlu Direview (HR)"
                            : isPimpinan
                            ? "Permohonan Yang Perlu Direview (Pimpinan)"
                            : "Daftar Semua Permohonan"}
                    </h1>
                    <div className="flex gap-2">
                        {isAnggota && (
                            <Button
                                onClick={() => setIsCreateDialogOpen(true)}
                                variant="default"
                                className="flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Buat Permohonan
                            </Button>
                        )}
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <ClipboardCheck className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <p>Memuat data...</p>
                    </div>
                ) : (isHRorPimpinan || permohonanList.length > 0) ? (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value)}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="pending">Menunggu Proses</TabsTrigger>
                                {isHRorPimpinan && <TabsTrigger value="history">History Permohonan</TabsTrigger>}
                            </TabsList>
                            
                            <TabsContent value="pending">
                                {permohonanList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <ClipboardCheck className="w-12 h-12 mb-4" />
                                        <p className="text-lg font-medium">Tidak ada permohonan aktif yang menunggu proses</p>
                                        {isAnggota && (
                            <Button
                                onClick={() => setIsCreateDialogOpen(true)}
                                variant="outline"
                                className="mt-4"
                            >
                                Buat Permohonan Baru
                            </Button>
                        )}
                    </div>
                ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                                {!isAnggota && <TableHead>Personel</TableHead>}
                                    <TableHead>Jenis Permohonan</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permohonanList.map((permohonan, index) => (
                                    <TableRow key={permohonan.id}>
                                        <TableCell>{index + 1}</TableCell>
                                                    {!isAnggota && (
                                            <TableCell>{permohonan.personel_username}</TableCell>
                                        )}
                                        <TableCell>{permohonan.jenis_permohonan_display}</TableCell>
                                        <TableCell>
                                            {new Date(permohonan.date_created).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                                    permohonan.status
                                                )}`}
                                            >
                                                {permohonan.status_display}
                                            </span>
                                            {getExpiryIndicator(permohonan)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenDetail(permohonan)}
                                                >
                                                    Detail
                                                </Button>
                                                {canReview(permohonan) && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleOpenReview(permohonan)}
                                                    >
                                                                    {isPimpinan ? "Setujui/Tolak" : "Review"}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                                )}
                            </TabsContent>
                            
                            {isHRorPimpinan && (
                                <TabsContent value="history">
                                    {historyLoading ? (
                                        <div className="flex justify-center items-center py-20">
                                            <p>Memuat history permohonan...</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Jenis</TableHead>
                                                    <TableHead>Personel</TableHead>
                                                    <TableHead>Tanggal Diproses</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {historyPermohonanList.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                                            Tidak ada history permohonan
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    historyPermohonanList.map((permohonan) => (
                                                        <TableRow key={permohonan.id}>
                                                            <TableCell className="font-medium">
                                                                {permohonan.jenis_permohonan_display}
                                                            </TableCell>
                                                            <TableCell>{permohonan.personel_username}</TableCell>
                                                            <TableCell>
                                                                {new Date(permohonan.date_updated).toLocaleString("id-ID")}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(permohonan.status)}`}>
                                                                    {permohonan.status_display}
                                                                </span>
                                                                {getExpiryIndicator(permohonan)}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedPermohonan(permohonan);
                                                                        setIsDetailDialogOpen(true);
                                                                    }}
                                                                >
                                                                    Detail
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <ClipboardCheck className="w-12 h-12 mb-4" />
                        <p className="text-lg font-medium">Tidak ada permohonan ditemukan</p>
                        {isAnggota && (
                            <Button
                                onClick={() => setIsCreateDialogOpen(true)}
                                variant="outline"
                                className="mt-4"
                            >
                                Buat Permohonan Baru
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <FooterCopyright />

            <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            >
                <CreatePermohonanDialog
                    onSuccess={() => {
                        setIsCreateDialogOpen(false);
                        handleRefresh();
                    }}
                />
            </Dialog>

            <Dialog
                open={isReviewDialogOpen}
                onOpenChange={setIsReviewDialogOpen}
            >
                {selectedPermohonan && (
                    <ReviewPermohonanDialog
                        permohonan={selectedPermohonan}
                        onSuccess={() => {
                            setIsReviewDialogOpen(false);
                            handleRefresh();
                        }}
                    />
                )}
            </Dialog>

            <Dialog
                open={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}
            >
                {selectedPermohonan && (
                    <PermohonanDetail 
                        permohonan={selectedPermohonan}
                        onReview={(permohonan) => {
                            setIsDetailDialogOpen(false);
                            setSelectedPermohonan(permohonan);
                            setIsReviewDialogOpen(true);
                        }}
                    />
                )}
            </Dialog>
        </div>
    );
};

export default PermohonanPage; 