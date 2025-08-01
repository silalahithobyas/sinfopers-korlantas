import ErrorDialog from "@/components/Dialog/ErrorDialog";
import SuccessDialog from "@/components/Dialog/SuccessDialog";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useDeletePersonnel from "@/routes/PersonelPage/hooks/useDeletePersonnel";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSWRConfig } from "swr";

interface Props {
  id: string;
  onComplete?: () => void;
}

const DeleteDialog = ({ id, onComplete }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogState, setDialogState] = useState<
    "success" | "failed" | "confirmation"
  >("confirmation");
  const [errorMessage, setErrorMessage] = useState<string>("Data gagal dihapus. Periksa jaringan Anda");
  const { mutate } = useSWRConfig();

  // Auto-close dialog after success dan refresh halaman
  useEffect(() => {
    if (dialogState === "success") {
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
        // Refresh halaman secara otomatis setelah sukses
        window.location.reload();
      }, 1000); // Persingkat waktu menjadi 1 detik
      return () => clearTimeout(timer);
    }
  }, [dialogState, onComplete]);

  const handleOnConfirmDelete = () => {
    if (isLoading) return;
    setIsLoading(true);
    useDeletePersonnel({ id })
      .then((_) => {
        setDialogState("success");
        // Refresh data table setelah sukses menghapus
        mutate((key) => typeof key === 'string' && key.startsWith('/personil'));
      })
      .catch((error) => {
        if (error?.response?.data?.message?.includes("registered in an organizational structure")) {
          setErrorMessage("Personil ini terdaftar dalam struktur divisi dan tidak dapat dihapus.");
        } else {
          setErrorMessage("Data gagal dihapus. Periksa jaringan Anda");
        }
        setDialogState("failed");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleOnClose = () => {
    setDialogState("confirmation");
    setErrorMessage("Data gagal dihapus. Periksa jaringan Anda");
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <DialogContent onCloseAutoFocus={handleOnClose}>
      {dialogState === "confirmation" && (
        <>
          <DialogHeader>
            <DialogTitle>Hapus Data</DialogTitle>
            <DialogDescription>Yakin ingin menghapus data?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleOnConfirmDelete}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Konfirmasi"}
            </Button>
          </DialogFooter>
        </>
      )}
      {dialogState === "success" && (
        <SuccessDialog message="Data berhasil dihapus" />
      )}
      {dialogState === "failed" && (
        <ErrorDialog message={errorMessage} />
      )}
    </DialogContent>
  );
};

export default DeleteDialog;
