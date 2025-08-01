import axiosClient from "@/networks/apiClient";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import { useNavigate } from "react-router-dom";

interface Props {
  id: number;
  personnelId: string;
}

const usePutEditNode = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const editNode = async ({ id, personnelId }: Props) => {
    // Cek apakah user memiliki role HR
    if (!hasRole([UserRole.HR])) {
      // Redirect ke unauthorized jika bukan HR
      navigate("/unauthorized");
      return false;
    }

    try {
      const data = {
        node_id: id,
        personnel_id: personnelId,
      };

      const response = await axiosClient.put(`/organizational-structure/nodes/${id}/`, data);
      return response.data.success;
    } catch (error) {
      console.error("Error editing node:", error);
      throw error; // Throw error untuk di-handle di component
    }
  };

  return { editNode };
};

export default usePutEditNode;