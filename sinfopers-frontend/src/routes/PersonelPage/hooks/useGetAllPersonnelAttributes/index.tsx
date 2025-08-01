import { useState } from "react";
import { PersonnelAttribute } from "../types";
import axiosClient from "@/networks/apiClient";

const useGetAllPersonnelAttributes = () => {
  const [position, setPosition] = useState<PersonnelAttribute[]>([]);
  const [rank, setRank] = useState<PersonnelAttribute[]>([]);
  const [subSatKer, setSubSatKer] = useState<PersonnelAttribute[]>([]);
  const [subDit, setSubDit] = useState<PersonnelAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Menggunakan Promise.all untuk fetch data secara paralel
      const [positionRes, rankRes, subSatKerRes, subDitRes] = await Promise.all([
        axiosClient.get("/personil/jabatan"),
        axiosClient.get("/personil/pangkat"),
        axiosClient.get("/personil/subsatker"),
        axiosClient.get("/personil/subdit")
      ]);
      
      setPosition(positionRes.data.data || []);
      setRank(rankRes.data.data || []);
      setSubSatKer(subSatKerRes.data.data || []);
      setSubDit(subDitRes.data.data || []);
    } catch (err) {
      console.error("Error fetching personnel attributes:", err);
      setError("Gagal mengambil data atribut personel");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchData,
    position,
    rank,
    subSatKer,
    subDit,
    isLoading,
    error
  };
};

export default useGetAllPersonnelAttributes;
