import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Dialog
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

// Kombinasi schema dari user dan personil
const formSchema = z.object({
    // User fields
    username: z.string().min(3, "Username minimal 3 karakter"),
    email: z.string().email("Email tidak valid").optional().or(z.literal("")),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
    role: z.enum(["admin", "hr", "pimpinan", "anggota"]),
    
    // Personil fields
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
    jabatan: z.string({
        required_error: "Jabatan wajib diisi",
    }),
    pangkat: z.string({
        required_error: "Pangkat wajib diisi",
    }),
    subsatker: z.string({
        required_error: "SubSatKer wajib diisi",
    }),
    subdit: z.string({
        required_error: "SubDit wajib diisi",
    }),
    bko: z.string({
        required_error: "BKO wajib diisi",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
});

interface CreateUserPersonilDialogProps {
    onSuccess: () => void;
}

const CreateUserPersonilDialog = ({ onSuccess }: CreateUserPersonilDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [pangkatOptions, setPangkatOptions] = useState<any[]>([]);
    const [jabatanOptions, setJabatanOptions] = useState<any[]>([]);
    const [subsatkerOptions, setSubsatkerOptions] = useState<any[]>([]);
    const [subditOptions, setSubditOptions] = useState<any[]>([]);
    const { toast } = useToast();
    
    // State untuk Error Dialog
    const [errorDialog, setErrorDialog] = useState({
        isOpen: false,
        title: "",
        description: "",
        fields: {} // untuk menyimpan field errors
    });

    // Daftar field yang valid untuk form
    type FormField = keyof z.infer<typeof formSchema>;
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "anggota",
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

    // Ambil data untuk dropdown
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingOptions(true);
            try {
                // Perbaiki URL endpoint API
                const [pangkatRes, jabatanRes, subsatkerRes, subditRes] = await Promise.all([
                    axiosClient.get("/personil/pangkat/"),
                    axiosClient.get("/personil/jabatan/"),
                    axiosClient.get("/personil/subsatker/"),
                    axiosClient.get("/personil/subdit/"),
                ]);
                
                console.log("Response pangkat lengkap:", pangkatRes);
                console.log("Response jabatan lengkap:", jabatanRes);
                console.log("Response subsatker lengkap:", subsatkerRes);
                console.log("Response subdit lengkap:", subditRes);
                
                // Periksa respon dan ekstrak data dengan benar
                // Penanganan untuk berbagai format respons API
                const extractData = (response: any) => {
                    if (response.data?.data) return response.data.data;
                    if (response.data?.success && Array.isArray(response.data.data)) return response.data.data;
                    if (Array.isArray(response.data)) return response.data;
                    return [];
                };
                
                // Tambahkan interface untuk tipe data dropdown
                interface DropdownItem {
                    id?: string | number;
                    _id?: string | number;
                    uuid?: string;
                    nama?: string;
                    name?: string;
                }
                
                const pangkatData = extractData(pangkatRes) as DropdownItem[];
                const jabatanData = extractData(jabatanRes) as DropdownItem[];
                const subsatkerData = extractData(subsatkerRes) as DropdownItem[];
                const subditData = extractData(subditRes) as DropdownItem[];
                
                console.log("Pangkat data:", pangkatData);
                console.log("Jabatan data:", jabatanData);
                console.log("SubSatKer data:", subsatkerData);
                console.log("SubDit data:", subditData);
                
                // Periksa dan log format ID untuk debugging
                if (pangkatData.length > 0) {
                    console.log("Contoh ID pangkat:", pangkatData[0].id, "Tipe:", typeof pangkatData[0].id);
                }
                if (jabatanData.length > 0) {
                    console.log("Contoh ID jabatan:", jabatanData[0].id, "Tipe:", typeof jabatanData[0].id);
                }
                
                setPangkatOptions(pangkatData);
                setJabatanOptions(jabatanData);
                setSubsatkerOptions(subsatkerData);
                setSubditOptions(subditData);
            } catch (error: any) {
                console.error("Error fetching options:", error);
                // Tampilkan pesan error yang lebih spesifik
                let errorMessage = "Tidak dapat memuat data untuk form.";
                if (error.response) {
                    errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Terjadi kesalahan pada server'}`;
                } else if (error.request) {
                    errorMessage = "Tidak ada respons dari server";
                } else {
                    errorMessage = error.message;
                }
                
                toast({
                    variant: "destructive",
                    title: "Gagal memuat data",
                    description: errorMessage
                });
            } finally {
                setIsLoadingOptions(false);
            }
        };
        
        fetchData();
    }, [toast]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            const { confirmPassword, ...formValues } = values;

            // Validasi terakhir sebelum submit
            if (!formValues.pangkat || !formValues.jabatan || !formValues.subsatker || !formValues.subdit) {
                // Gunakan dialog error untuk validasi
                setErrorDialog({
                    isOpen: true,
                    title: "Data tidak lengkap",
                    description: "Pastikan Pangkat, Jabatan, Sub Satker, dan Sub Dit telah dipilih",
                    fields: {}
                });
                setIsLoading(false);
                return;
            }

            // Format data yang akan dikirim ke backend
            const submitValues = {
                // User data
                username: formValues.username,
                email: formValues.email || '',
                password: formValues.password,
                role: formValues.role,
                
                // Personil data
                nama: formValues.nama,
                jenis_kelamin: formValues.jenis_kelamin,
                nrp: Number(formValues.nrp), // Pastikan format yang benar (integer)
                status: formValues.status,
                jabatan: formValues.jabatan, // Gunakan ID langsung dari form
                pangkat: formValues.pangkat, // Gunakan ID langsung dari form
                subsatker: formValues.subsatker, // Gunakan ID langsung dari form
                subdit: formValues.subdit, // Gunakan ID langsung dari form
                bko: formValues.bko,
            };
            
            // Log data yang akan dikirim
            console.log("Mengirim data ke server:", submitValues);
            
            try {
                // Set header application/json secara eksplisit
                const response = await axiosClient.post("/auth/users-personil/", submitValues, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Respons server:", response.data);
                
                if (response.data.success) {
                    toast({
                        title: "Berhasil",
                        description: "User dan personil berhasil dibuat",
                    });
                    form.reset();
                    onSuccess();
                }
            } catch (error: any) {
                console.error("Error creating user and personil:", error);
                
                // Log detail error untuk debugging
                if (error.response) {
                    console.error("Response data:", error.response.data);
                    console.error("Response status:", error.response.status);
                    console.error("Response headers:", error.response.headers);
                    
                    const errorData = error.response.data;
                    let errorTitle = "Gagal membuat user dan personil";
                    let errorDescription = "Terjadi kesalahan saat membuat user dan personil";
                    let fieldErrors: Record<string, any> = {};
                    
                    // Cek apakah response memiliki format yang diharapkan
                    if (errorData) {
                        // Ambil pesan utama
                        if (errorData.message) {
                            errorTitle = errorData.message;
                        }
                        
                        // Ambil detail error fields
                        if (errorData.errors) {
                            fieldErrors = errorData.errors;
                            
                            // Tambahkan error ke form state
                            Object.keys(fieldErrors).forEach(fieldName => {
                                // Gunakan casting tipe untuk memastikan fieldName adalah FormField yang valid
                                const field = fieldName as FormField;
                                if (form.getFieldState(field)) {
                                    form.setError(field, {
                                        type: "server",
                                        message: Array.isArray(fieldErrors[fieldName]) 
                                            ? fieldErrors[fieldName].join(', ') 
                                            : String(fieldErrors[fieldName])
                                    });
                                }
                            });
                            
                            // Buat deskripsi error dari semua field error
                            errorDescription = Object.entries(fieldErrors)
                                .map(([field, message]) => {
                                    const formattedMessage = Array.isArray(message) 
                                        ? message.join(', ') 
                                        : String(message);
                                    return `${field}: ${formattedMessage}`;
                                })
                                .join('\n');
                        } else if (errorData.detail) {
                            errorDescription = errorData.detail;
                        }
                    }
                    
                    // Tampilkan error dengan Dialog
                    setErrorDialog({
                        isOpen: true,
                        title: errorTitle,
                        description: errorDescription,
                        fields: fieldErrors
                    });
                } else {
                    // Error tanpa response dari server
                    setErrorDialog({
                        isOpen: true,
                        title: "Gagal menghubungi server",
                        description: "Terjadi kesalahan saat menghubungi server. Silakan coba lagi nanti.",
                        fields: {}
                    });
                }
            }
        } catch (formError) {
            console.error("Form validation error:", formError);
            setErrorDialog({
                isOpen: true,
                title: "Validasi Gagal",
                description: "Pastikan semua field sudah diisi dengan benar",
                fields: {}
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk menutup dialog error
    const closeErrorDialog = () => {
        setErrorDialog(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat User dan Personil Baru</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Kolom kiri - Informasi Akun */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Informasi Akun</h3>
                                
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Username" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email (opsional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Konfirmasi Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Konfirmasi Password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="hr">HR</SelectItem>
                                                    <SelectItem value="pimpinan">Pimpinan</SelectItem>
                                                    <SelectItem value="anggota">Anggota</SelectItem>
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
                                
                                <FormField
                                    control={form.control}
                                    name="nama"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Lengkap</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nama lengkap" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="jenis_kelamin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jenis Kelamin</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih jenis kelamin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="L">Laki-laki</SelectItem>
                                                    <SelectItem value="P">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="nrp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>NRP</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="NRP (8 digit)"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="pangkat"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pangkat</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={isLoadingOptions}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className={isLoadingOptions ? "opacity-50" : ""}>
                                                            <SelectValue placeholder="Pilih Pangkat" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingOptions ? (
                                                            <SelectItem value="loading" disabled>
                                                                Memuat data...
                                                            </SelectItem>
                                                        ) : pangkatOptions.length > 0 ? (
                                                            pangkatOptions.map((pangkat) => {
                                                                const itemId = String(pangkat.id || pangkat._id || pangkat.uuid || "");
                                                                return (
                                                                    <SelectItem key={itemId} value={itemId}>
                                                                        {pangkat.nama || pangkat.name || "Pangkat " + itemId}
                                                                    </SelectItem>
                                                                );
                                                            })
                                                        ) : (
                                                            <SelectItem value="empty" disabled>
                                                                Tidak ada data
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="jabatan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Jabatan</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        console.log("Jabatan dipilih:", value);
                                                        field.onChange(value);
                                                    }}
                                                    value={field.value || ""}
                                                    disabled={isLoadingOptions}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isLoadingOptions ? "Memuat data..." : "Pilih jabatan"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingOptions ? (
                                                            <SelectItem value="loading" disabled>
                                                                Memuat data...
                                                            </SelectItem>
                                                        ) : jabatanOptions.length > 0 ? (
                                                            jabatanOptions.map((jabatan) => {
                                                                const itemId = String(jabatan.id || jabatan._id || jabatan.uuid || "");
                                                                return (
                                                                    <SelectItem key={itemId} value={itemId}>
                                                                        {jabatan.nama || jabatan.name || "Jabatan " + itemId}
                                                                    </SelectItem>
                                                                );
                                                            })
                                                        ) : (
                                                            <SelectItem value="empty" disabled>
                                                                Tidak ada data
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="subsatker"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sub Satker</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        console.log("SubSatKer dipilih:", value);
                                                        field.onChange(value);
                                                    }}
                                                    value={field.value || ""}
                                                    disabled={isLoadingOptions}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isLoadingOptions ? "Memuat data..." : "Pilih Sub Satker"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingOptions ? (
                                                            <SelectItem value="loading" disabled>
                                                                Memuat data...
                                                            </SelectItem>
                                                        ) : subsatkerOptions.length > 0 ? (
                                                            subsatkerOptions.map((subsatker) => {
                                                                const itemId = String(subsatker.id || subsatker._id || subsatker.uuid || "");
                                                                return (
                                                                    <SelectItem key={itemId} value={itemId}>
                                                                        {subsatker.nama || subsatker.name || "Sub Satker " + itemId}
                                                                    </SelectItem>
                                                                );
                                                            })
                                                        ) : (
                                                            <SelectItem value="empty" disabled>
                                                                Tidak ada data
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subdit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Sub Dit</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        console.log("SubDit dipilih:", value);
                                                        field.onChange(value);
                                                    }}
                                                    value={field.value || ""}
                                                    disabled={isLoadingOptions}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isLoadingOptions ? "Memuat data..." : "Pilih Sub Dit"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {isLoadingOptions ? (
                                                            <SelectItem value="loading" disabled>
                                                                Memuat data...
                                                            </SelectItem>
                                                        ) : subditOptions.length > 0 ? (
                                                            subditOptions.map((subdit) => {
                                                                const itemId = String(subdit.id || subdit._id || subdit.uuid || "");
                                                                return (
                                                                    <SelectItem key={itemId} value={itemId}>
                                                                        {subdit.nama || subdit.name || "Sub Dit " + itemId}
                                                                    </SelectItem>
                                                                );
                                                            })
                                                        ) : (
                                                            <SelectItem value="empty" disabled>
                                                                Tidak ada data
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Aktif">Aktif</SelectItem>
                                                        <SelectItem value="Non Aktif">Non Aktif</SelectItem>
                                                        <SelectItem value="Cuti">Cuti</SelectItem>
                                                        <SelectItem value="Pensiun">Pensiun</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bko"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>BKO</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih BKO" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Gasus masuk">Gasus masuk</SelectItem>
                                                        <SelectItem value="Gasum masuk">Gasum masuk</SelectItem>
                                                        <SelectItem value="Gasus keluar">Gasus keluar</SelectItem>
                                                        <SelectItem value="Gasum keluar">Gasum keluar</SelectItem>
                                                        <SelectItem value="-">-</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
            
            {/* Dialog untuk menampilkan pesan error */}
            <Dialog open={errorDialog.isOpen} onOpenChange={closeErrorDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">{errorDialog.title}</DialogTitle>
                    </DialogHeader>
                    <div className="whitespace-pre-line text-sm py-2">
                        {errorDialog.description}
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={closeErrorDialog}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CreateUserPersonilDialog; 