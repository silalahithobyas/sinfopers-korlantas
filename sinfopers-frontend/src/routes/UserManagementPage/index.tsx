// src/routes/UserManagementPage/index.tsx
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
import { Plus, Edit, Trash, UserPlus, Info } from "lucide-react";
import axiosClient from "@/networks/apiClient";
import FooterCopyright from "@/components/FooterCopyright";
import CreateUserDialog from "./components/CreateUserDialog";
import EditUserDialog from "./components/EditUserDialog";
import DeleteUserDialog from "./components/DeleteUserDialog";
import CreateUserPersonilDialog from "./components/CreateUserPersonilDialog";
import UserDetailDialog from "./components/UserDetailDialog";


// Definisikan interface User
interface User {
    id: string;
    username: string;
    email: string | null;
    role: 'admin' | 'hr' | 'pimpinan' | 'anggota';
    is_active: boolean;
}

const UserManagementPage = () => {
    // Gunakan interface User sebagai tipe data state
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCreateUserPersonilDialogOpen, setIsCreateUserPersonilDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get("/auth/users/");
            // console.log("API Response:", response.data);
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };



    const handleRefresh = () => {
        fetchUsers();
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

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar page={NavbarPageEnum.userManagement} />
            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
                        <div className="flex space-x-3">
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah User
                        </Button>
                            <Button onClick={() => setIsCreateUserPersonilDialogOpen(true)} variant="default">
                                <UserPlus className="mr-2 h-4 w-4" /> Tambah User & Personil
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.username}</TableCell>
                                                <TableCell>{user.email || "-"}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            user.is_active
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {user.is_active ? "Aktif" : "Nonaktif"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsDetailDialogOpen(true);
                                                            }}
                                                        >
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsEditDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                Tidak ada data user
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog untuk tambah user */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <CreateUserDialog
                    onSuccess={() => {
                        handleRefresh();
                        setIsCreateDialogOpen(false);
                    }}
                />
            </Dialog>

            {/* Dialog untuk tambah user & personil */}
            <Dialog open={isCreateUserPersonilDialogOpen} onOpenChange={setIsCreateUserPersonilDialogOpen}>
                <CreateUserPersonilDialog
                    onSuccess={() => {
                        handleRefresh();
                        setIsCreateUserPersonilDialogOpen(false);
                    }}
                />
            </Dialog>

            {/* Dialog untuk edit user */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <EditUserDialog
                    user={selectedUser}
                    onSuccess={() => {
                        handleRefresh();
                        setIsEditDialogOpen(false);
                    }}
                />
            </Dialog>

            {/* Dialog untuk hapus user */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DeleteUserDialog
                    user={selectedUser}
                    onSuccess={() => {
                        handleRefresh();
                        setIsDeleteDialogOpen(false);
                    }}
                />
            </Dialog>

            {/* Dialog untuk detail user */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <UserDetailDialog
                    userId={selectedUser?.id || null}
                    onClose={() => {
                        setIsDetailDialogOpen(false);
                    }}
                />
            </Dialog>

            <FooterCopyright />
        </div>
    );
};

export default UserManagementPage;