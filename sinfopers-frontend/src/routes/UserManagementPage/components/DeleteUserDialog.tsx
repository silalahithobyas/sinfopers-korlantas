// src/routes/UserManagementPage/components/DeleteUserDialog.tsx
import { useState } from "react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axiosClient from "@/networks/apiClient";

interface User {
    id: string;
    username: string;
    email: string | null;
    role: 'admin' | 'hr' | 'pimpinan' | 'anggota';
    is_active: boolean;
}

interface DeleteUserDialogProps {
    user: User | null;
    onSuccess: () => void;
}

const DeleteUserDialog = ({ user, onSuccess }: DeleteUserDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const response = await axiosClient.delete(`/auth/users/${user.id}/`);
            if (response.data.success) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Konfirmasi Nonaktifkan User</DialogTitle>
                <DialogDescription>
                    Apakah Anda yakin ingin menonaktifkan user <strong>{user.username}</strong>?
                    User yang dinonaktifkan tidak dapat masuk ke sistem.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={onSuccess}
                    disabled={isLoading}
                >
                    Batal
                </Button>
                <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                >
                    {isLoading ? "Menonaktifkan..." : "Nonaktifkan"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default DeleteUserDialog;