// src/routes/PersonelPage/hooks/useDeletePersonnel/index.tsx
import axiosClient from "@/networks/apiClient";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import { useNavigate } from "react-router-dom";

interface Props {
  id: string;
}

const useDeletePersonnel = async ({ id }: Props) => {
  // Catatan: Ini function async langsung, sehingga tidak bisa menggunakan hooks React
  // Di sini kita memerlukan cara alternatif untuk melakukan pengecekan role

  // Alternatif 1: Periksa token/cookie langsung
  // Alternatif 2: Pass fungsi pengecekan dari komponen pemanggil
  // Alternatif 3: Ubah menjadi custom hook yang mengembalikan fungsi

  try {
    // Untuk sekarang, kita lanjutkan dengan operasi tanpa pengecekan
    // Pengecekan role sudah ditangani di level UI
    const response = await axiosClient.delete(`/personil/${id}/`);
    return response.data.success;
  } catch (error) {
    console.error("Error deleting personnel:", error);
    throw error;
  }
};

// Versi hook yang lebih aman:
export const useDeletePersonnelWithAuth = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  return async (id: string) => {
    if (!hasRole([UserRole.ADMIN, UserRole.HR])) {
      navigate("/unauthorized");
      return false;
    }

    try {
      const response = await axiosClient.delete(`/personil/${id}/`);
      return response.data.success;
    } catch (error) {
      console.error("Error deleting personnel:", error);
      throw error; // Pastikan error dilempar ke komponen untuk ditangani
    }
  };
};

export default useDeletePersonnel;