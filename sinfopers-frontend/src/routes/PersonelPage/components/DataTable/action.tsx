// src/routes/PersonelPage/components/DataTable/action.tsx
import { Button } from "@/components/ui/button";
import { DialogTrigger, Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import DeleteDialog from "../Dialog/DeleteDialog";
import EditDialog from "../Dialog/EditDialog";
import { useState } from "react";
import { Personnel } from "../../hooks/useGetPersonnel/types";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";

interface Props {
  personnel: Personnel;
}

const Action = ({ personnel }: Props) => {
  const [actionType, setActionType] = useState("edit");
  const [open, setOpen] = useState(false);
  const { hasRole } = useAuth();

  // Cek jika pengguna memiliki role HR atau Admin
  const canEdit = hasRole([UserRole.ADMIN, UserRole.HR]);

  // Jika user tidak memiliki izin, tampilkan div kosong
  if (!canEdit) {
    return <div></div>; // Tampilkan div kosong agar tetap ada cell di tabel
  }

  const handleDialogClose = () => {
    setOpen(false);
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setActionType("edit")}>
                Ubah Data
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setActionType("delete")}>
                Hapus Data
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        {actionType === "delete" && <DeleteDialog id={personnel.id} onComplete={handleDialogClose} />}
        {actionType === "edit" && <EditDialog personnel={personnel} onComplete={handleDialogClose} />}
      </Dialog>
  );
};

export default Action;