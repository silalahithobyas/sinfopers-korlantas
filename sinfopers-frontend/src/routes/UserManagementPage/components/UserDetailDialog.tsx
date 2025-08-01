import { useState, useEffect } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axiosClient from "@/networks/apiClient";
import { useToast } from "@/components/ui/use-toast";

// Interface untuk User
interface User {
    id: string;
    username: string;
    email: string | null;
    role: "admin" | "hr" | "pimpinan" | "anggota";
    is_active: boolean;
}

// Interface untuk Personil
interface Personil {
    id: string;
    nama: string;
    nrp: number;
    jenis_kelamin: string;
    status: string;
    bko: string;
    pangkat: string;
    jabatan: string;
    subsatker: string;
    subdit: string;
}

// Interface untuk detail gabungan
interface UserPersonilDetail {
    user: User;
    has_personil: boolean;
    personil: Personil | null;
}

interface UserDetailDialogProps {
    userId: string | null;
    onClose: () => void;
}

const UserDetailDialog = ({ userId, onClose }: UserDetailDialogProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userDetail, setUserDetail] = useState<UserPersonilDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (userId) {
            fetchUserDetail(userId);
        }
    }, [userId]);

    const fetchUserDetail = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get(`/auth/users/${id}/with-personil/`);
            if (response.data.success) {
                setUserDetail(response.data.data);
            } else {
                setError("Gagal mendapatkan data: " + (response.data.message || "Unknown error"));
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Gagal mendapatkan detail user",
                });
            }
        } catch (error: any) {
            console.error("Error fetching user detail:", error);
            setError("Terjadi kesalahan saat mengambil data");
            toast({
                variant: "destructive",
                title: "Error",
                description: "Gagal mendapatkan detail user: " + (error.response?.data?.message || error.message),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleBadgeClass = (role: User['role']) => {
        switch (role) {
            case 'admin':
                return "bg-red-100 text-red-800";
            case 'hr':
                return "bg-blue-100 text-blue-800";
            case 'pimpinan':
                return "bg-green-100 text-green-800";
            case 'anggota':
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (isLoading) {
        return (
            <DialogContent>
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
            </DialogContent>
        );
    }

    if (error || !userDetail) {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Error</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-center text-red-500">
                    {error || "Tidak dapat memuat data user"}
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        );
    }

    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Detail User</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
                {/* User Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-600">Informasi Akun</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="font-medium">{userDetail.user.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{userDetail.user.email || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(userDetail.user.role)}`}>
                                {userDetail.user.role}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    userDetail.user.is_active
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >
                                {userDetail.user.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Personil Information Section (if available) */}
                {userDetail.has_personil && userDetail.personil ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 text-green-600">Informasi Personil</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm text-gray-500">Nama Lengkap</p>
                                <p className="font-medium">{userDetail.personil.nama}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">NRP</p>
                                <p className="font-medium">{userDetail.personil.nrp}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Jenis Kelamin</p>
                                <p className="font-medium">
                                    {userDetail.personil.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">{userDetail.personil.status}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pangkat</p>
                                <p className="font-medium">{userDetail.personil.pangkat}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Jabatan</p>
                                <p className="font-medium">{userDetail.personil.jabatan}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Sub Satker</p>
                                <p className="font-medium">{userDetail.personil.subsatker}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Sub Dit</p>
                                <p className="font-medium">{userDetail.personil.subdit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">BKO</p>
                                <p className="font-medium">{userDetail.personil.bko}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-amber-700">User ini tidak terhubung dengan data personil</p>
                    </div>
                )}
            </div>

            <DialogFooter>
                <Button onClick={onClose}>Tutup</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default UserDetailDialog; 