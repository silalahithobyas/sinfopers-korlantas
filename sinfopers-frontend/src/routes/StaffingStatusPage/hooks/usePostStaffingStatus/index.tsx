import axiosClient from "@/networks/apiClient";
import { AxiosError } from "axios";

interface Props {
  satker: string;
  irjenPol: number;
  brigjenPol: number;
  kombesPol: number;
  akbp: number;
  komPol: number;
  akp: number;
  ip: number;
  brikTa: number;
  iv: number;
  iii: number;
  ii: number;
}

const usePostStaffingStatus = async ({
  satker,
  irjenPol,
  brigjenPol,
  kombesPol,
  akbp,
  komPol,
  akp,
  ip,
  brikTa,
  iv,
  iii,
  ii,
}: Props) => {
  // Normalize satker name: trim whitespace and ensure exact case
  const normalizedSatker = satker.trim();
  
  const data = {
    satker: normalizedSatker,
    data: [
      {
        pangkat: "IRJEN",
        dsp: irjenPol,
      },
      {
        pangkat: "BRIGJEN",
        dsp: brigjenPol,
      },
      {
        pangkat: "KOMBES",
        dsp: kombesPol,
      },
      {
        pangkat: "AKBP",
        dsp: akbp,
      },
      {
        pangkat: "KOMPOL",
        dsp: komPol,
      },
      {
        pangkat: "AKP",
        dsp: akp,
      },
      {
        pangkat: "IP",
        dsp: ip,
      },
      {
        pangkat: "BRIGADIR",
        dsp: brikTa,
      },
      {
        pangkat: "IV",
        dsp: iv,
      },
      {
        pangkat: "III",
        dsp: iii,
      },
      {
        pangkat: "II/I",
        dsp: ii,
      },
    ],
  };
  
  console.log("Sending staffing status data:", JSON.stringify(data, null, 2));
  
  try {
    const response = await axiosClient.post("/staffing-status/", data);
    return response.data.success;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error posting staffing status:", axiosError.response?.data);
    console.error("Full error details:", {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data
    });
    throw error;
  }
};

export default usePostStaffingStatus;
