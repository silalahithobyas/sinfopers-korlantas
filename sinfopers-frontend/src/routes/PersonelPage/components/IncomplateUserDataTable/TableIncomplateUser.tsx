import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import axiosClient from "@/networks/apiClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
// import { UserRole } from "@/hooks/useAuth/types";
// import useAuth from "@/hooks/useAuth";
import DialogFormContent from "./DialogFormContent";

// Definisikan interface User
interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
  is_active: boolean;
}

const TableIncomplateUser = () => {
  // Gunakan interface User sebagai tipe data state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  // const { hasRole } = useAuth();
  // const canEdit = hasRole([UserRole.ADMIN, UserRole.HR]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/auth/users/incomplete/");

      console.log("Full API Response:", response);

      if (response.data?.success) {
        if (response.data.data?.results) {
          setUsers(response.data.data.results);
        } else {
          console.error("Unexpected response structure:", response.data);
          setUsers([]);
        }
      } else {
        console.error("API request not successful:", response.data);
        setUsers([]);
      }
    } catch (error: any) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // const handleRefresh = () => {
  //     fetchUsers();
  // };

  const getRoleBadgeClass = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "hr":
        return "bg-blue-100 text-blue-800";
      case "pimpinan":
        return "bg-green-100 text-green-800";
      case "anggota":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="flex-1 p-8 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
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
                        <TableCell className="font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
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
       
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="items-center text-center">
                                  <Plus className="" /> 
                                </Button>
                              </DialogTrigger>

                              <DialogFormContent id={user.id} initialName={user.username} />
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
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
    </>
  );
};

export default TableIncomplateUser;
