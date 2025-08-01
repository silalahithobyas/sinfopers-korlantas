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
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosClient from "@/networks/apiClient";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import Cookies from "js-cookie";

// Schema validasi form
const formSchema = z.object({
    // User ID yang akan dipilih
    user_id: z.string({
        required_error: "User wajib dipilih",
    }),
    
    // Fields untuk personil
    nama: z.string().min(3, "Nama wajib diisi"),
    jenis_kelamin: z.string({
        required_error: "Jenis kelamin wajib diisi",
    }),
    nrp: z.coerce
        .number({
            required_error: "NRP wajib diisi",
            invalid_type_error: "NRP harus berupa angka",
        })
        .int("NRP harus berupa bilangan bulat")
        .gte(10_000_000, "NRP harus 8 digit, minimal 10000000")
        .lte(99_999_999, "NRP harus 8 digit, maksimal 99999999"),
    status: z.string({
        required_error: "Status wajib diisi",
    }),
    jabatan: z.union([z.string(), z.number()]).transform(val => String(val)),
    pangkat: z.union([z.string(), z.number()]).transform(val => String(val)),
    subsatker: z.union([z.string(), z.number()]).transform(val => String(val)),
    subdit: z.union([z.string(), z.number()]).transform(val => String(val)),
    bko: z.string({
        required_error: "BKO wajib diisi",
    }),
});

// Interface untuk user tanpa personil
interface UnlinkedUser {
    id: string;
    username: string;
    email: string | null;
    role: string;
}

interface LinkPersonilToUserDialogProps {
    onSuccess: () => void;
}

// Styling khusus untuk mengatasi masalah dropdown
const selectStyles = {
  trigger: {
    color: "#333 !important",
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  value: {
    color: "#333 !important",
    fontWeight: "normal",
  },
  content: {
    backgroundColor: "#fff",
    color: "#333",
  },
  item: {
    color: "#333",
    backgroundColor: "#fff",
  }
};

const LinkPersonilToUserDialog = ({ onSuccess }: LinkPersonilToUserDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [unlinkedUsers, setUnlinkedUsers] = useState<UnlinkedUser[]>([]);
    const [pangkatOptions, setPangkatOptions] = useState<any[]>([]);
    const [jabatanOptions, setJabatanOptions] = useState<any[]>([]);
    const [subsatkerOptions, setSubsatkerOptions] = useState<any[]>([]);
    const [subditOptions, setSubditOptions] = useState<any[]>([]);
    const { toast } = useToast();
    
    // State untuk dialog error
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_id: "",
            nama: "",
            jenis_kelamin: "",
            nrp: undefined,
            status: "Aktif",
            bko: "-",
            pangkat: "",
            jabatan: "",
            subsatker: "",
            subdit: "",
        },
    });

    // Ambil data dropdowns
    useEffect(() => {
        const extractData = (response: any) => {
            if (response.data?.data) return response.data.data;
            if (response.data?.success && Array.isArray(response.data.data)) return response.data.data;
            if (Array.isArray(response.data)) return response.data;
            return [];
        };
        
        const fetchData = async () => {
            setIsLoadingOptions(true);
            try {
                console.log("Mengambil data untuk dropdown...");
                console.log("Cookies jwt_token:", Cookies.get("jwt_token") ? "Ada" : "Tidak ada");
                
                // Perbaiki URL dengan struktur yang benar sesuai URLconf Django
                console.log("Memulai request untuk data referensi");
                
                try {
                    const pangkatRes = await axiosClient.get("/personil/pangkat/");
                    console.log("Pangkat response:", pangkatRes?.data);
                    setPangkatOptions(extractData(pangkatRes));
                } catch (err) {
                    console.error("Error fetching pangkat:", err);
                }
                
                try {
                    const jabatanRes = await axiosClient.get("/personil/jabatan/");
                    console.log("Jabatan response:", jabatanRes?.data);
                    setJabatanOptions(extractData(jabatanRes));
                } catch (err) {
                    console.error("Error fetching jabatan:", err);
                }
                
                try {
                    const subsatkerRes = await axiosClient.get("/personil/subsatker/");
                    console.log("Subsatker response:", subsatkerRes?.data);
                    setSubsatkerOptions(extractData(subsatkerRes));
                } catch (err) {
                    console.error("Error fetching subsatker:", err);
                }
                
                try {
                    const subditRes = await axiosClient.get("/personil/subdit/");
                    console.log("Subdit response:", subditRes?.data);
                    setSubditOptions(extractData(subditRes));
                } catch (err) {
                    console.error("Error fetching subdit:", err);
                }
                
            } catch (error: any) {
                console.error("Error fetching options:", error);
                console.error("Error response:", error.response?.data);
                console.error("Status code:", error.response?.status);
                toast({
                    variant: "destructive",
                    title: "Gagal memuat data",
                    description: "Tidak dapat memuat data untuk form."
                });
            } finally {
                setIsLoadingOptions(false);
            }
        };
        
        fetchData();
    }, [toast]);

    // Ambil daftar user yang belum terhubung dengan personil
    useEffect(() => {
        const fetchUnlinkedUsers = async () => {
            setIsLoadingUsers(true);
            try {
                // URL tanpa /api/v1/ tetap menggunakan auth/users/unlinked
                console.log("Mengambil daftar user yang tidak terhubung...");
                const response = await axiosClient.get("/auth/users/unlinked/");
                console.log("Response unlinked users:", response.data);
                if (response.data?.success) {
                    setUnlinkedUsers(response.data.data);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Gagal memuat data user",
                        description: "Tidak dapat memuat daftar user yang tersedia."
                    });
                }
            } catch (error: any) {
                console.error("Error fetching unlinked users:", error);
                console.error("Error response:", error.response);
                toast({
                    variant: "destructive", 
                    title: "Error",
                    description: "Gagal memuat daftar user yang tersedia."
                });
            } finally {
                setIsLoadingUsers(false);
            }
        };
        
        fetchUnlinkedUsers();
    }, [toast]);

    // Handle perubahan saat user dipilih
    const handleUserSelected = (userId: string) => {
        // Cari user yang dipilih
        const selectedUser = unlinkedUsers.find(user => user.id === userId);
        
        if (selectedUser) {
            // Auto-fill nama dan email dari user yang dipilih
            form.setValue("nama", selectedUser.username);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setErrorMessage(null);
        
        try {
            setIsLoading(true);
            
            // Buat objek data yang sesuai dengan format yang diharapkan backend
            // Pastikan semua field yang diperlukan ada dan dalam format yang benar
            const submitData = {
                user_id: values.user_id,
                nama: values.nama,
                jenis_kelamin: values.jenis_kelamin,
                nrp: Number(values.nrp), // Pastikan NRP dalam format number
                status: values.status,
                jabatan: String(values.jabatan), // Pastikan dalam format string
                pangkat: String(values.pangkat), // Pastikan dalam format string
                subsatker: String(values.subsatker), // Pastikan dalam format string
                subdit: String(values.subdit), // Pastikan dalam format string
                bko: values.bko
            };
            
            // Log data yang akan dikirim dengan format yang lebih jelas
            console.log("Mengirim data ke server:", JSON.stringify(submitData, null, 2));
            console.log("Tipe data field dropdown:", {
                jabatan: typeof submitData.jabatan + " - " + submitData.jabatan,
                pangkat: typeof submitData.pangkat + " - " + submitData.pangkat,
                subsatker: typeof submitData.subsatker + " - " + submitData.subsatker,
                subdit: typeof submitData.subdit + " - " + submitData.subdit
            });
            
            // URL yang sudah diperbaiki di backend
            const apiEndpoint = "/personil/link-to-user/";
            console.log("Menggunakan endpoint API:", apiEndpoint);
            
            // Tambahkan headers yang eksplisit
            const response = await axiosClient.post(apiEndpoint, submitData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log("Response from server:", response.data);
            
            if (response.data?.success) {
                toast({
                    title: "Berhasil",
                    description: "Personil berhasil dibuat dan dihubungkan dengan user."
                });
                
                // Panggil callback onSuccess untuk refresh data induk
                onSuccess();
            } else {
                setErrorMessage(response.data?.message || "Terjadi kesalahan saat menghubungkan personil dengan user.");
                console.error("Response error:", response.data);
            }
        } catch (error: any) {
            console.error("Error creating personil and linking to user:", error);
            console.error("Error response status:", error.response?.status);
            console.error("Error response data:", JSON.stringify(error.response?.data, null, 2));
            
            // Tampilkan toast error
            toast({
                variant: "destructive",
                title: "Gagal membuat personil",
                description: "Terjadi kesalahan saat membuat personil dan menghubungkannya dengan user."
            });
            
            // Set error message dengan lebih detail
            if (error.response?.data) {
                console.log("Response data:", error.response.data);
                console.log("Response status:", error.response.status);
                
                // Tampilkan pesan error spesifik
                if (error.response.data.errors) {
                    const errorDetails = error.response.data.errors;
                    let errorMsg = "Validasi gagal:";
                    
                    // Cek jika error berupa objek dengan berbagai field
                    if (typeof errorDetails === 'object') {
                        // Loop untuk setiap field yang error
                        for (const field in errorDetails) {
                            if (Array.isArray(errorDetails[field])) {
                                // Join semua pesan error dalam field tersebut
                                errorMsg += `\n- ${field}: ${errorDetails[field].join(", ")}`;
                            } else {
                                errorMsg += `\n- ${field}: ${errorDetails[field]}`;
                            }
                        }
                    } else {
                        errorMsg = `${error.response.data.message || "Validasi gagal"}: ${JSON.stringify(errorDetails)}`;
                    }
                    
                    setErrorMessage(errorMsg);
                } else if (error.response.data.message) {
                    setErrorMessage(error.response.data.message);
                } else if (typeof error.response.data === 'string') {
                    setErrorMessage(error.response.data);
                } else {
                    setErrorMessage("Terjadi kesalahan tidak terduga pada server.");
                }
            } else {
                setErrorMessage(error.message || "Terjadi kesalahan tidak terduga.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Hubungkan User dengan Personil</DialogTitle>
                <DialogDescription>
                    Pilih user yang sudah ada dan buat data personil baru.
                </DialogDescription>
            </DialogHeader>

            {errorMessage && (
                <div className="bg-red-50 text-red-800 p-4 mb-4 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-1" />
                    <div className="w-full">
                        <div className="font-semibold">Error</div>
                        <div className="text-sm whitespace-pre-line">{errorMessage}</div>
                    </div>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kolom kiri - Informasi User */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Informasi User</h3>
                            
                            {/* Pilih User */}
                            <FormField
                                control={form.control}
                                name="user_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pilih User</FormLabel>
                                        <Select
                                            disabled={isLoadingUsers || isLoading}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                handleUserSelected(value);
                                            }}
                                            value={field.value || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger style={selectStyles.trigger}>
                                                    <SelectValue 
                                                        style={selectStyles.value}
                                                        placeholder={isLoadingUsers ? "Memuat user..." : "Pilih user..."} 
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent style={selectStyles.content}>
                                                {isLoadingUsers ? (
                                                    <div className="p-2 text-center">Memuat...</div>
                                                ) : unlinkedUsers.length === 0 ? (
                                                    <div className="p-2 text-center">Tidak ada user tersedia</div>
                                                ) : (
                                                    unlinkedUsers.map((user) => (
                                                        <SelectItem 
                                                            key={user.id} 
                                                            value={user.id}
                                                            style={selectStyles.item}
                                                        >
                                                            {user.username} ({user.role})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Nama (diisi otomatis dari username) */}
                            <FormField
                                control={form.control}
                                name="nama"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Masukkan nama" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* NRP */}
                            <FormField
                                control={form.control}
                                name="nrp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>NRP</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number"
                                                placeholder="Masukkan NRP (8 digit)" 
                                                {...field} 
                                                disabled={isLoading}
                                                onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Jenis Kelamin */}
                            <FormField
                                control={form.control}
                                name="jenis_kelamin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Jenis Kelamin</FormLabel>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            value={field.value || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger style={selectStyles.trigger}>
                                                    <SelectValue 
                                                        style={selectStyles.value}
                                                        placeholder="Pilih jenis kelamin" 
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent style={selectStyles.content}>
                                                <SelectItem value="L" style={selectStyles.item}>Laki-laki</SelectItem>
                                                <SelectItem value="P" style={selectStyles.item}>Perempuan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Kolom kanan - Informasi Personil */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Informasi Personil</h3>
                            
                            {/* Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            defaultValue="Aktif"
                                        >
                                            <FormControl>
                                                <SelectTrigger style={selectStyles.trigger}>
                                                    <SelectValue 
                                                        style={selectStyles.value} 
                                                        placeholder="Pilih status" 
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent style={selectStyles.content}>
                                                <SelectItem value="Aktif" style={selectStyles.item}>Aktif</SelectItem>
                                                <SelectItem value="Non Aktif" style={selectStyles.item}>Non Aktif</SelectItem>
                                                <SelectItem value="Cuti" style={selectStyles.item}>Cuti</SelectItem>
                                                <SelectItem value="Pensiun" style={selectStyles.item}>Pensiun</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {/* Pangkat */}
                                <FormField
                                    control={form.control}
                                    name="pangkat"
                                    render={({ field }) => {
                                        const selectedPangkat = pangkatOptions.find(p => p.id === field.value);
                                        
                                        return (
                                            <FormItem>
                                                <FormLabel>Pangkat</FormLabel>
                                                <Select
                                                    disabled={isLoadingOptions || isLoading}
                                                    onValueChange={(value) => {
                                                        console.log("Pangkat dipilih:", value, typeof value);
                                                        // Konversi ke string saat dipilih
                                                        field.onChange(value);
                                                    }}
                                                    value={field.value ? String(field.value) : undefined}
                                                    key={`pangkat-${field.value}`} // Force re-render when value changes
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="text-gray-900">
                                                            <SelectValue 
                                                                placeholder={
                                                                    selectedPangkat 
                                                                        ? selectedPangkat.nama 
                                                                        : (isLoadingOptions ? "Memuat data..." : "Pilih pangkat")
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingOptions ? (
                                                            <div className="p-2 text-center text-gray-700">Memuat...</div>
                                                        ) : (
                                                            pangkatOptions.map((pangkat) => (
                                                                <SelectItem 
                                                                    key={pangkat.id} 
                                                                    value={String(pangkat.id)}
                                                                    className="text-gray-900"
                                                                >
                                                                    {pangkat.nama}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />

                                {/* Jabatan */}
                                <FormField
                                    control={form.control}
                                    name="jabatan"
                                    render={({ field }) => {
                                        const selectedJabatan = jabatanOptions.find(j => j.id === field.value);
                                        
                                        return (
                                            <FormItem>
                                                <FormLabel>Jabatan</FormLabel>
                                                <Select
                                                    disabled={isLoadingOptions || isLoading}
                                                    onValueChange={(value) => {
                                                        console.log("Jabatan dipilih:", value, typeof value);
                                                        field.onChange(value);
                                                    }}
                                                    value={field.value ? String(field.value) : undefined}
                                                    key={`jabatan-${field.value}`} // Force re-render when value changes
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="text-gray-900">
                                                            <SelectValue 
                                                                placeholder={
                                                                    selectedJabatan 
                                                                        ? selectedJabatan.nama 
                                                                        : (isLoadingOptions ? "Memuat data..." : "Pilih jabatan")
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingOptions ? (
                                                            <div className="p-2 text-center text-gray-700">Memuat...</div>
                                                        ) : (
                                                            jabatanOptions.map((jabatan) => (
                                                                <SelectItem 
                                                                    key={jabatan.id} 
                                                                    value={String(jabatan.id)}
                                                                    className="text-gray-900"
                                                                >
                                                                    {jabatan.nama}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* SubSatKer */}
                                <FormField
                                    control={form.control}
                                    name="subsatker"
                                    render={({ field }) => {
                                        const selectedSubsatker = subsatkerOptions.find(s => s.id === field.value);
                                        
                                        return (
                                            <FormItem>
                                                <FormLabel>Sub Satker</FormLabel>
                                                <Select
                                                    disabled={isLoadingOptions || isLoading}
                                                    onValueChange={(value) => {
                                                        console.log("SubSatKer dipilih:", value, typeof value);
                                                        field.onChange(value);
                                                    }}
                                                    value={field.value ? String(field.value) : undefined}
                                                    key={`subsatker-${field.value}`} // Force re-render when value changes
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="text-gray-900">
                                                            <SelectValue 
                                                                placeholder={
                                                                    selectedSubsatker 
                                                                        ? selectedSubsatker.nama 
                                                                        : (isLoadingOptions ? "Memuat data..." : "Pilih sub satker")
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingOptions ? (
                                                            <div className="p-2 text-center text-gray-700">Memuat...</div>
                                                        ) : (
                                                            subsatkerOptions.map((subsatker) => (
                                                                <SelectItem 
                                                                    key={subsatker.id} 
                                                                    value={String(subsatker.id)}
                                                                    className="text-gray-900"
                                                                >
                                                                    {subsatker.nama}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />

                                {/* SubDit */}
                                <FormField
                                    control={form.control}
                                    name="subdit"
                                    render={({ field }) => {
                                        const selectedSubdit = subditOptions.find(s => s.id === field.value);
                                        
                                        return (
                                            <FormItem>
                                                <FormLabel>Sub Dit</FormLabel>
                                                <Select
                                                    disabled={isLoadingOptions || isLoading}
                                                    onValueChange={(value) => {
                                                        console.log("SubDit dipilih:", value, typeof value);
                                                        field.onChange(value);
                                                    }}
                                                    value={field.value ? String(field.value) : undefined}
                                                    key={`subdit-${field.value}`} // Force re-render when value changes
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="text-gray-900">
                                                            <SelectValue 
                                                                placeholder={
                                                                    selectedSubdit 
                                                                        ? selectedSubdit.nama 
                                                                        : (isLoadingOptions ? "Memuat data..." : "Pilih sub dit")
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingOptions ? (
                                                            <div className="p-2 text-center text-gray-700">Memuat...</div>
                                                        ) : (
                                                            subditOptions.map((subdit) => (
                                                                <SelectItem 
                                                                    key={subdit.id} 
                                                                    value={String(subdit.id)}
                                                                    className="text-gray-900"
                                                                >
                                                                    {subdit.nama}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>

                            {/* BKO */}
                            <FormField
                                control={form.control}
                                name="bko"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>BKO</FormLabel>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            defaultValue="-"
                                        >
                                            <FormControl>
                                                <SelectTrigger style={selectStyles.trigger}>
                                                    <SelectValue 
                                                        style={selectStyles.value}
                                                        placeholder="Pilih BKO" 
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent style={selectStyles.content}>
                                                <SelectItem value="-" style={selectStyles.item}>-</SelectItem>
                                                <SelectItem value="Gasus masuk" style={selectStyles.item}>Gasus masuk</SelectItem>
                                                <SelectItem value="Gasum masuk" style={selectStyles.item}>Gasum masuk</SelectItem>
                                                <SelectItem value="Gasus keluar" style={selectStyles.item}>Gasus keluar</SelectItem>
                                                <SelectItem value="Gasum keluar" style={selectStyles.item}>Gasum keluar</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || isLoadingOptions || isLoadingUsers}>
                            {isLoading ? "Menyimpan..." : "Hubungkan"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default LinkPersonilToUserDialog;