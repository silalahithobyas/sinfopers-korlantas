import axiosClient from "@/networks/apiClient";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import { useNavigate } from "react-router-dom";

interface Props {
  chartId: string;
  nodeId: number;
}

const useDeleteNode = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const deleteNode = async ({ chartId, nodeId }: Props) => {
    // Cek apakah user memiliki role HR
    if (!hasRole([UserRole.HR])) {
      // Redirect ke unauthorized jika bukan HR
      navigate("/unauthorized");
      return false;
    }

    try {
      const data = {
        node_id: nodeId,
      };
      const response = await axiosClient.delete(
          `/organizational-structure/nodes/${chartId}/`,
          { data }
      );
      return response.data.success;
    } catch (error) {
      console.error("Error deleting node:", error);
      return false;
    }
  };

  return { deleteNode };
};

export default useDeleteNode;
