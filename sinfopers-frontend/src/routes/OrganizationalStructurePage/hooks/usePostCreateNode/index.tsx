import axiosClient from "@/networks/apiClient";
import { OrgNode } from "../../types";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import { useNavigate } from "react-router-dom";

interface Props {
  organizationId: string;
  parentId: number;
  personnelId: string;
  offset: boolean;
  item: OrgNode;
  parentOffsetId?: number;
}

const usePostCreateNode = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const createNode = async ({
                              organizationId,
                              parentId,
                              personnelId,
                              offset,
                              item,
                              parentOffsetId,
                            }: Props) => {
    // Cek apakah user memiliki role HR
    if (!hasRole([UserRole.HR])) {
      // Redirect ke unauthorized jika bukan HR
      navigate("/unauthorized");
      return false;
    }

    try {
      let id = parentId;
      // Check if item has child
      item.child.forEach((node) => {
        if(node.offset) {
          id = node.id;
          return;
        }
      });

      // force to parent if is offset child
      if (parentOffsetId) {
        id = parentOffsetId;
      }

      const data = {
        parent_id: id,
        personnel_id: personnelId,
        offset: offset,
      };
      const response = await axiosClient.post(
          `/organizational-structure/${parentOffsetId ? "offset-" : ""}child-nodes/${organizationId}/`,
          data
      );
      return response.data.success;
    } catch (error) {
      console.error("Error creating node:", error);
      throw error; // Throw error untuk di-handle di component
    }
  };

  return { createNode };
};

export default usePostCreateNode;