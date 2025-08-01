import axiosClient from "@/networks/apiClient";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import { useNavigate } from "react-router-dom";

interface Props {
  organizationName: string;
  personnelId: string;
}

const usePostCreateOrganization = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const createOrganization = async ({
                                      organizationName,
                                      personnelId,
                                    }: Props) => {
    // Cek apakah user memiliki role HR
    if (!hasRole([UserRole.HR])) {
      // Redirect ke unauthorized jika bukan HR
      navigate("/unauthorized");
      return false;
    }

    try {
      const data = {
        nama_chart: organizationName,
        personnel_id: personnelId,
      };

      const response = await axiosClient.post("/organizational-structure/chart/", data);
      return response.data.success || true;
    } catch (error) {
      console.error("Error creating organization:", error);
      return false;
    }
  };

  return { createOrganization };
};

export default usePostCreateOrganization;