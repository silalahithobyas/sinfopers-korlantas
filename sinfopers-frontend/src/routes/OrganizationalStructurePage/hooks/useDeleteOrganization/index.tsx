import axiosClient from "@/networks/apiClient";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import { useNavigate } from "react-router-dom";

interface Props {
  id: string;
}

const useDeleteOrganization = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const deleteOrganization = async ({ id }: Props) => {
    // Cek apakah user memiliki role HR
    if (!hasRole([UserRole.HR])) {
      // Redirect ke unauthorized jika bukan HR
      navigate("/unauthorized");
      return false;
    }

    try {
      const response = await axiosClient.delete(`/organizational-structure/chart/${id}/`);
      return response.data.success;
    } catch (error) {
      console.error("Error deleting organization:", error);
      return false;
    }
  };

  return { deleteOrganization };
};

export default useDeleteOrganization;