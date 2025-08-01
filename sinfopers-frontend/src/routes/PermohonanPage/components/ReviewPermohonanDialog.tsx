import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import axiosClient from "@/networks/apiClient";
import { FileIcon, ExternalLinkIcon, CheckSquare, AlertTriangle } from "lucide-react";
import { getFileNameFromPath, openFileInNewTab } from "@/utils/fileHelper";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    catatan_pimpinan: string | null;
    date_created: string;
    date_updated: string;
}

// Schema untuk validasi HR
const hrFormSchema = z.object({
    status: z.enum(["valid", "tidak_valid"]),
    catatan_hr: z.string().min(1, "Catatan wajib diisi").optional().or(z.literal("")),
    dokumen_diperiksa: z.boolean().refine(val => val, {
        message: "Wajib memeriksa dokumen pendukung"
    }),
    tanggal_sesuai: z.boolean().refine(val => val, {
        message: "Wajib memastikan kesesuaian tanggal"
    })
});

// Schema untuk validasi Pimpinan
const pimpinanFormSchema = z.object({
    status: z.enum(["disetujui", "ditolak"]),
    catatan_pimpinan: z.string().min(1, "Catatan wajib diisi").optional().or(z.literal(""))
});

type HRFormValues = z.infer<typeof hrFormSchema>;
type PimpinanFormValues = z.infer<typeof pimpinanFormSchema>;

interface ReviewPermohonanDialogProps {
    permohonan: Permohonan;
    onSuccess: () => void;
}

const ReviewPermohonanDialog = ({ permohonan, onSuccess }: ReviewPermohonanDialogProps) => {
    const { role } = useAuth();
    const isHR = role === UserRole.HR;
    const isPimpinan = role === UserRole.PIMPINAN;

    // Form untuk HR
    const hrForm = useForm<HRFormValues>({
        resolver: zodResolver(hrFormSchema),
        defaultValues: {
            status: "valid",
            catatan_hr: "",
            dokumen_diperiksa: false,
            tanggal_sesuai: false
        },
    });

    // Form untuk Pimpinan
    const pimpinanForm = useForm<PimpinanFormValues>({
        resolver: zodResolver(pimpinanFormSchema),
        defaultValues: {
            status: "disetujui",
            catatan_pimpinan: "",
        },
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    
    // Set status default berdasarkan role
    useEffect(() => {
        if (isHR) {
            setSelectedStatus("valid");
        } else if (isPimpinan) {
            setSelectedStatus("disetujui");
        }
    }, [isHR, isPimpinan]);
    
    const handleHRSubmit = async (data: HRFormValues) => {
        try {
            setIsSubmitting(true);
            
            // Validasi berbagai kondisi
            if (!data.dokumen_diperiksa || !data.tanggal_sesuai) {
                if (!data.dokumen_diperiksa) {
                    hrForm.setError("dokumen_diperiksa", {
                        type: "manual",
                        message: "Mohon periksa dokumen terlebih dahulu"
                    });
                }
                
                if (!data.tanggal_sesuai) {
                    hrForm.setError("tanggal_sesuai", {
                        type: "manual",
                        message: "Mohon konfirmasi kesesuaian tanggal/waktu"
                    });
                }
                setIsSubmitting(false);
                return;
            }
            
            if (data.status === "tidak_valid" && !data.catatan_hr) {
                hrForm.setError("catatan_hr", {
                    type: "manual",
                    message: "Catatan wajib diisi jika status Tidak Valid"
                });
                setIsSubmitting(false);
                return;
            }
            
            // Kirim form HR
            const requestData = {
                status: data.status,
                catatan_hr: data.catatan_hr || ""
            };
            
            console.log("Mengirim data HR review:", requestData);
            
            await axiosClient.post(
                `/permohonan/${permohonan.id}/hr-review/`,
                requestData
            );
            
            // Sukses
            toast({
                title: "Validasi Berhasil",
                description: `Permohonan telah ${data.status === "valid" ? "divalidasi" : "ditolak"}`,
            });
            onSuccess();
        } catch (error: any) {
            console.error("Error submitting HR review:", error);
            
            let errorMessage = "Terjadi kesalahan saat memproses permohonan.";
            
            // Handling berbagai format error response
            if (error.response) {
                if (error.response.data?.errors?.catatan_hr) {
                    hrForm.setError("catatan_hr", {
                        type: "manual",
                        message: error.response.data.errors.catatan_hr[0]
                    });
                } 
                else if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                }
                else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }
            
            toast({
                title: "Validasi Gagal",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePimpinanSubmit = async (data: PimpinanFormValues) => {
        try {
            setIsSubmitting(true);
            
            if (data.status === "ditolak" && !data.catatan_pimpinan) {
                pimpinanForm.setError("catatan_pimpinan", {
                    type: "manual",
                    message: "Catatan wajib diisi jika permohonan ditolak"
                });
                setIsSubmitting(false);
                return;
            }
            
            // Kirim form Pimpinan
            const requestData = {
                status: data.status,
                catatan_pimpinan: data.catatan_pimpinan || ""
            };
            
            console.log("Mengirim data Pimpinan review:", requestData);
            
            await axiosClient.post(
                `/permohonan/${permohonan.id}/pimpinan-review/`,
                requestData
            );
            
            // Sukses
            toast({
                title: "Review Berhasil",
                description: `Permohonan telah ${data.status === "disetujui" ? "disetujui" : "ditolak"}`,
            });
            onSuccess();
        } catch (error: any) {
            console.error("Error submitting Pimpinan review:", error);
            
            let errorMessage = "Terjadi kesalahan saat memproses permohonan.";
            
            // Handling berbagai format error response
            if (error.response) {
                if (error.response.data?.errors?.catatan_pimpinan) {
                    pimpinanForm.setError("catatan_pimpinan", {
                        type: "manual",
                        message: error.response.data.errors.catatan_pimpinan[0]
                    });
                } 
                else if (error.response.data?.detail) {
                    errorMessage = error.response.data.detail;
                }
                else if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }
            
            toast({
                title: "Review Gagal",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>
                    {isHR ? "Validasi Permohonan" : "Review Permohonan"}
                </DialogTitle>
                <DialogDescription>
                    {isHR 
                        ? "Silakan periksa dokumen pendukung dan validasi permohonan ini"
                        : "Silakan review dan berikan keputusan untuk permohonan ini"}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mb-4">
                <div>
                    <h3 className="text-sm font-medium">Personel:</h3>
                    <p className="text-sm text-gray-700">{permohonan.personel_username}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium">Jenis Permohonan:</h3>
                    <p className="text-sm text-gray-700">{permohonan.jenis_permohonan_display}</p>
                </div>
                <div>
                    <h3 className="text-sm font-medium">Alasan:</h3>
                    <p className="text-sm text-gray-700">{permohonan.alasan}</p>
                </div>
                
                {/* File pendukung dengan tampilan yang diperbarui */}
                {permohonan.file_pendukung && (
                    <div className="border rounded-md p-3 bg-gray-50">
                        <h3 className="text-sm font-medium mb-2">File Pendukung:</h3>
                        <div className="flex items-center gap-2">
                            <FileIcon className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-gray-700">
                                {getFileNameFromPath(permohonan.file_pendukung)}
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="ml-2 flex items-center gap-1 text-xs"
                                onClick={() => openFileInNewTab(permohonan.file_pendukung)}
                            >
                                <ExternalLinkIcon className="w-3 h-3" />
                                Lihat File
                            </Button>
                        </div>
                    </div>
                )}

                {/* Form untuk HR */}
                {isHR && (
                    <Form {...hrForm}>
                        <form onSubmit={hrForm.handleSubmit(handleHRSubmit)} className="space-y-4">
                            <div className="border rounded-md p-3 bg-blue-50">
                                <h3 className="text-sm font-medium mb-2">Validasi Dokumen:</h3>
                                
                                <div className="space-y-2">
                                    <FormField
                                        control={hrForm.control}
                                        name="dokumen_diperiksa"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Saya telah memeriksa dokumen pendukung
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={hrForm.control}
                                        name="tanggal_sesuai"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Tanggal/waktu dalam dokumen sesuai dengan permohonan
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <Label>Status Validasi:</Label>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div
                                        className={`flex items-center border rounded-md p-3 cursor-pointer ${selectedStatus === "valid" ? "bg-blue-50 border-blue-300" : "bg-gray-50"}`}
                                        onClick={() => {
                                            hrForm.setValue("status", "valid");
                                            setSelectedStatus("valid");
                                        }}
                                    >
                                        <CheckSquare className={`w-5 h-5 mr-2 ${selectedStatus === "valid" ? "text-blue-600" : "text-gray-400"}`} />
                                        <div>
                                            <p className="font-medium text-sm">Valid</p>
                                            <p className="text-xs text-gray-500">Lanjut ke Pimpinan</p>
                                        </div>
                                    </div>
                                    
                                    <div
                                        className={`flex items-center border rounded-md p-3 cursor-pointer ${selectedStatus === "tidak_valid" ? "bg-red-50 border-red-300" : "bg-gray-50"}`}
                                        onClick={() => {
                                            hrForm.setValue("status", "tidak_valid");
                                            setSelectedStatus("tidak_valid");
                                        }}
                                    >
                                        <AlertTriangle className={`w-5 h-5 mr-2 ${selectedStatus === "tidak_valid" ? "text-red-600" : "text-gray-400"}`} />
                                        <div>
                                            <p className="font-medium text-sm">Tidak Valid</p>
                                            <p className="text-xs text-gray-500">Kembalikan ke Personel</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <FormField
                                control={hrForm.control}
                                name="catatan_hr"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Catatan Review HR:</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Masukkan catatan review (wajib jika status Tidak Valid)" 
                                                className="resize-none h-[80px]" 
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {selectedStatus === "tidak_valid" && (
                                                <span className="text-red-500">*Catatan wajib diisi jika status Tidak Valid</span>
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting ? "Memproses..." : "Simpan Validasi"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}

                {/* Form untuk Pimpinan */}
                {isPimpinan && (
                    <Form {...pimpinanForm}>
                        <form onSubmit={pimpinanForm.handleSubmit(handlePimpinanSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Keputusan:</Label>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div
                                        className={`flex items-center border rounded-md p-3 cursor-pointer ${selectedStatus === "disetujui" ? "bg-green-50 border-green-300" : "bg-gray-50"}`}
                                        onClick={() => {
                                            pimpinanForm.setValue("status", "disetujui");
                                            setSelectedStatus("disetujui");
                                        }}
                                    >
                                        <CheckSquare className={`w-5 h-5 mr-2 ${selectedStatus === "disetujui" ? "text-green-600" : "text-gray-400"}`} />
                                        <div>
                                            <p className="font-medium text-sm">Disetujui</p>
                                            <p className="text-xs text-gray-500">Permohonan disetujui</p>
                                        </div>
                                    </div>
                                    
                                    <div
                                        className={`flex items-center border rounded-md p-3 cursor-pointer ${selectedStatus === "ditolak" ? "bg-red-50 border-red-300" : "bg-gray-50"}`}
                                        onClick={() => {
                                            pimpinanForm.setValue("status", "ditolak");
                                            setSelectedStatus("ditolak");
                                        }}
                                    >
                                        <AlertTriangle className={`w-5 h-5 mr-2 ${selectedStatus === "ditolak" ? "text-red-600" : "text-gray-400"}`} />
                                        <div>
                                            <p className="font-medium text-sm">Ditolak</p>
                                            <p className="text-xs text-gray-500">Permohonan ditolak</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <FormField
                                control={pimpinanForm.control}
                                name="catatan_pimpinan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Catatan Pimpinan:</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Masukkan catatan keputusan (wajib jika ditolak)" 
                                                className="resize-none h-[80px]" 
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {selectedStatus === "ditolak" && (
                                                <span className="text-red-500">*Catatan wajib diisi jika permohonan ditolak</span>
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting ? "Memproses..." : "Simpan Keputusan"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </div>
        </DialogContent>
    );
};

export default ReviewPermohonanDialog; 