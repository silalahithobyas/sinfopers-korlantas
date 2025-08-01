import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import axiosClient from "@/networks/apiClient";
import { FileIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    jenis_permohonan: z.enum(["Cuti", "Mutasi"]),
    alasan: z.string().min(10, "Alasan harus minimal 10 karakter"),
    file_pendukung: z.any()
        .refine(files => files?.[0], "File pendukung wajib diunggah")
        .refine(
            files => {
                if (!files?.[0]) return false;
                const fileType = files[0].type;
                return fileType === 'application/pdf';
            },
            "File harus berformat PDF"
        )
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePermohonanDialogProps {
    onSuccess: () => void;
}

const CreatePermohonanDialog = ({ onSuccess }: CreatePermohonanDialogProps) => {
    const [uploading, setUploading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [selectedFileError, setSelectedFileError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jenis_permohonan: "Cuti",
            alasan: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            setUploading(true);
            
            // Buat FormData untuk upload file
            const formData = new FormData();
            formData.append("jenis_permohonan", data.jenis_permohonan);
            formData.append("alasan", data.alasan);
            
            if (data.file_pendukung && data.file_pendukung[0]) {
                formData.append("file_pendukung", data.file_pendukung[0]);
            }
            
            const response = await axiosClient.post("/permohonan/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            // Jika sampai di sini, artinya request berhasil (status 2xx)
            console.log("Response dari server:", response.data);
            toast({
                title: "Permohonan Berhasil Dibuat",
                description: "Permohonan Anda telah berhasil diajukan dan sedang menunggu persetujuan HR.",
            });
            onSuccess();
        } catch (error: any) {
            console.error("Error creating permohonan:", error);
            toast({
                title: "Gagal Membuat Permohonan",
                description: error.response?.data?.message || "Terjadi kesalahan saat membuat permohonan.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setSelectedFileError(null);
        
        if (file) {
            if (file.type !== 'application/pdf') {
                setSelectedFileError("File harus berformat PDF");
                setSelectedFileName(file.name + " (Format tidak didukung)");
                form.setError("file_pendukung", {
                    type: "manual",
                    message: "File harus berformat PDF"
                });
            } else {
                setSelectedFileName(file.name);
                form.setValue("file_pendukung", e.target.files);
                form.clearErrors("file_pendukung");
            }
        } else {
            setSelectedFileName(null);
        }
    };

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Buat Permohonan Baru</DialogTitle>
                <DialogDescription>
                    Silakan isi data permohonan dengan lengkap dan unggah dokumen pendukung (format PDF)
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="jenis_permohonan"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jenis Permohonan</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis permohonan" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Cuti">Cuti</SelectItem>
                                        <SelectItem value="Mutasi">Mutasi</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="alasan"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alasan</FormLabel>
                                <FormControl>
                                    <textarea
                                        placeholder="Tuliskan alasan permohonan Anda di sini..."
                                        className="resize-none h-[100px] w-full px-3 py-2 border border-gray-300 rounded-md"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="file_pendukung"
                        render={() => (
                            <FormItem>
                                <FormLabel>
                                    Dokumen Pendukung <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormDescription>
                                    Unggah surat keterangan atau dokumen pendukung dalam format PDF
                                </FormDescription>
                                <FormControl>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                            accept="application/pdf"
                                        />
                                        <div className="flex gap-2 items-center">
                                            <label
                                                htmlFor="file-upload"
                                                className="cursor-pointer px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 transition-colors"
                                            >
                                                Pilih File
                                            </label>
                                            {selectedFileName ? (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <FileIcon className="h-4 w-4 mr-1" />
                                                    <span className={selectedFileError ? "text-red-500" : ""}>
                                                        {selectedFileName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">
                                                    Belum ada file yang dipilih
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </FormControl>
                                {selectedFileError && (
                                    <Alert variant="destructive" className="mt-2 py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle className="text-xs">Format file tidak didukung</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            Hanya file PDF yang diperbolehkan
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="w-full"
                        >
                            {uploading ? "Mengirim..." : "Kirim Permohonan"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default CreatePermohonanDialog; 