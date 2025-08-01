// src/routes/PersonelPage/hooks/usePostPersonnel/index.tsx
import { PersonnelDataInterface } from "../types";
import axiosClient from "@/networks/apiClient";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import { useNavigate } from "react-router-dom";

// Versi function biasa (untuk backward compatibility)
const usePostPersonnel = async ({
                                  nama,
                                  jenis_kelamin,
                                  nrp,
                                  status,
                                  jabatan,
                                  pangkat,
                                  subsatker,
                                  subdit,
                                  bko,
                                }: PersonnelDataInterface) => {
  const personnelData = {
    nama,
    jenis_kelamin: jenis_kelamin
        ?.replace("Laki-laki", "L")
        .replace("Perempuan", "P"),
    nrp,
    status,
    jabatan,
    pangkat,
    subsatker,
    subdit,
    bko,
  };

  try {
    const response = await axiosClient.post("/personil/", personnelData);
    return response.data.success;
  } catch (error) {
    console.error("Error creating personnel:", error);
    throw error;
  }
};

// Versi hook dengan pengecekan role
export const usePostPersonnelWithAuth = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  return async (data: PersonnelDataInterface) => {
    if (!hasRole([UserRole.ADMIN, UserRole.HR])) {
      navigate("/unauthorized");
      return false;
    }

    const personnelData = {
      nama: data.nama,
      jenis_kelamin: data.jenis_kelamin
          ?.replace("Laki-laki", "L")
          .replace("Perempuan", "P"),
      nrp: data.nrp,
      status: data.status,
      jabatan: data.jabatan,
      pangkat: data.pangkat,
      subsatker: data.subsatker,
      subdit: data.subdit,
      bko: data.bko,
    };

    try {
      const response = await axiosClient.post("/personil/", personnelData);
      return response.data.success;
    } catch (error) {
      console.error("Error creating personnel:", error);
      throw error;
    }
  };
};

export default usePostPersonnel;