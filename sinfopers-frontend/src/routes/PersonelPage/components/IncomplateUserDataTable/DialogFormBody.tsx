import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import data_bko from "@/routes/PersonelPage/data/data-bko";
import data_status from "@/routes/PersonelPage/data/data-status";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import SuccessDialog from "@/components/Dialog/SuccessDialog";
import ErrorDialog from "@/components/Dialog/ErrorDialog";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import useGetAllPersonnelAttributes from "@/routes/PersonelPage/hooks/useGetAllPersonnelAttributes";
import personnelFormSchema from "@/routes/PersonelPage/entities/formSchema";
import { Personnel } from "@/routes/PersonelPage/hooks/useGetPersonnel/types";
import DialogStateEnum from "@/routes/PersonelPage/entities/enum";
import Dropdown from "../Dialog/components/DialogDropdown";
import DialogInput from "../Dialog/components/DialogInput";
// import Dropdown from "../DialogDropdown";
// import DialogInput from "../DialogInput";
import { PersonnelDataInterface } from "@/routes/PersonelPage/hooks/types";
import useGetPersonnel from "@/routes/PersonelPage/hooks/useGetPersonnel";
import { AxiosError } from "axios";

interface Props {
  id:string,
  initialNama:string,
  personnel?: Personnel;
  form: UseFormReturn<z.infer<typeof personnelFormSchema>>;
  onAction: ({
    id,
    nama,
    jenis_kelamin,
    nrp,
    status,
    jabatan,
    pangkat,
    subsatker,
    subdit,
    bko,
  }: PersonnelDataInterface) => Promise<any>;
  onComplete?: () => void;
}

const DialogFormBody = ({ id, initialNama, form, onAction, onComplete }: Props) => {
  const { position, rank, subSatKer, subDit, fetchData, isLoading } =
    useGetAllPersonnelAttributes();

  const { mutate: refetchGetPersonnel } = useGetPersonnel({
    limit: 10,
    page: 1,
  });

  const [isLoadingState, setIsLoadingState] = useState(false);
  const [positionId, setPositionId] = useState<number>();
  const [rankId, setRankId] = useState<number>();
  const [subSatKerId, setSubSatKerId] = useState<number>();
  const [subDitId, setSubDitId] = useState<number>();
  const [dialogState, setDialogState] = useState<DialogStateEnum>(
    DialogStateEnum.form
  );
  const [errorDetails, setErrorDetails] = useState<string>("");
  useEffect(() => {
    console.log(id)
    console.log(initialNama)
  },[])

  // Auto-close dialog after success
  useEffect(() => {
    if (dialogState === DialogStateEnum.success) {
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

  // Konversi data dari API menjadi format yang bisa digunakan oleh Dropdown
  const convertToDropdownFormat = (data: Array<{ id: number; nama: string }>) => {
    return data.map((item) => item.nama);
  };

  // Handler untuk mengambil ID saat memilih dropdown
  const handleSelectRank = (value: string) => {
    const selectedRank = rank.find((item) => item.nama === value);
    if (selectedRank) {
      setRankId(selectedRank.id);
    }
  };

  const handleSelectPosition = (value: string) => {
    const selectedPosition = position.find((item) => item.nama === value);
    if (selectedPosition) {
      setPositionId(selectedPosition.id);
    }
  };

  const handleSelectSubSatKer = (value: string) => {
    const selectedSubSatKer = subSatKer.find((item) => item.nama === value);
    if (selectedSubSatKer) {
      setSubSatKerId(selectedSubSatKer.id);
    }
  };

  const handleSelectSubDit = (value: string) => {
    const selectedSubDit = subDit.find((item) => item.nama === value);
    if (selectedSubDit) {
      setSubDitId(selectedSubDit.id);
    }
  };

  const handleSelectBKO = (_value: string) => {
    // Tidak perlu set ID untuk BKO karena hanya menggunakan nama
  };

  const handleSelectStatus = (_value: string) => {
    // Tidak perlu set ID untuk status karena hanya menggunakan nama
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format pesan error dari API
  const formatErrorMessage = (error: any) => {
    if (!error.response || !error.response.data) {
      return "Terjadi kesalahan pada server";
    }

    // Ekstrak data error
    const errorData = error.response.data;
    
    // Case 1: Error NRP sudah digunakan
    if (errorData.message && errorData.message.includes("NRP") && errorData.message.includes("sudah digunakan")) {
      return `Data tidak dapat disimpan karena:\n\n${errorData.message}\n\nSilakan gunakan NRP yang belum digunakan oleh personel lain.`;
    }
    
    // Case 2: Error staffing status
    if (errorData.message && errorData.message.includes("No staffing status found")) {
      return "Data tidak dapat disimpan karena:\n\nStatus kepegawaian belum tersedia untuk kombinasi Pangkat dan SubSatKer yang dipilih.\n\nSilakan hubungi admin untuk menambahkan data status kepegawaian terlebih dahulu pada Staffing Status.";
    }
    
    // Case 3: Required fields
    if (errorData.pangkat?.includes("required") || 
        errorData.jabatan?.includes("required") || 
        errorData.subsatker?.includes("required") || 
        errorData.subdit?.includes("required")) {
      
      let errorMessage = "Data tidak dapat disimpan karena ada field yang belum diisi:\n";
      
      if (errorData.pangkat?.includes("required")) {
        errorMessage += "- Pangkat belum dipilih\n";
      }
      if (errorData.jabatan?.includes("required")) {
        errorMessage += "- Jabatan belum dipilih\n";
      }
      if (errorData.subsatker?.includes("required")) {
        errorMessage += "- SubSatKer belum dipilih\n";
      }
      if (errorData.subdit?.includes("required")) {
        errorMessage += "- SubDit belum dipilih\n";
      }
      
      return errorMessage;
    }
    
    // Case 4: Generic error with message
    if (errorData.message) {
      return `Terjadi kesalahan: ${errorData.message.replace(/^Failed to add User Personnel: /, '')}`;
    }
    
    // Case 5: Fallback untuk error lainnya
    return "Terjadi kesalahan saat menyimpan data. Silakan coba lagi atau hubungi admin jika masalah berlanjut.";
  };

  const onButtonSave = async () => {
    if (dialogState === DialogStateEnum.form) {
      setDialogState(DialogStateEnum.confirm);
      return;
    }
    setIsLoadingState(true);
    const formValues = form.getValues();
    onAction({
      // id: personnel?.id,
      id: id,
      nama: formValues.name,
      jenis_kelamin: formValues.gender,
      nrp: formValues.NRP,
      status: formValues.status,
      jabatan: positionId,
      pangkat: rankId,
      subsatker: subSatKerId,
      subdit: subDitId,
      bko: formValues.BKO,
    })
      .then((_) => {
        setDialogState(DialogStateEnum.success);
        refetchGetPersonnel();
      })
      .catch((error: AxiosError) => {
        const errorMsg = formatErrorMessage(error);
        setErrorDetails(errorMsg);
        setDialogState(DialogStateEnum.failed);
      })
      .finally(() => {
        setIsLoadingState(false);
      });
    return;
  };

  const handleClose = () => {
    setDialogState(DialogStateEnum.form);
    setIsLoadingState(false);
    form.reset();
    if (onComplete) {
      onComplete();
    }
    // Refresh halaman ketika dialog ditutup, untuk memastikan tidak ada masalah UI
    window.location.reload();
  };

  const handleCancelSave = () => {
    if (isLoadingState) {
      return;
    }
    setDialogState(DialogStateEnum.form);
  };

  return (
    <DialogContent
      onCloseAutoFocus={handleClose}
      className={`${
        dialogState === DialogStateEnum.form &&
        "sm:max-w-2xl max-h-[90dvh] overflow-y-scroll"
      }`}
    >
      {dialogState === DialogStateEnum.success && (
        <SuccessDialog message="Data berhasil disimpan" />
      )}

      {dialogState === DialogStateEnum.failed && (
        <ErrorDialog message={errorDetails || "Gagal menyimpan data"} />
      )}

      {dialogState === DialogStateEnum.confirm && (
        <ConfirmationDialog
          title="Simpan Data"
          description="Anda yakin ingin menyimpan data?"
          isLoading={isLoadingState}
          onAccept={onButtonSave}
          onDecline={handleCancelSave}
        />
      )}

      {dialogState === DialogStateEnum.form && (
        <div>
          <DialogTitle>Data Personil</DialogTitle>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onButtonSave)}
              className="grid gap-4 py-4"
            >
              <DialogInput
                control={form.control}
                name="name"
                placeholder="Masukkan nama"
                label="Nama"
              />

              <Dropdown
                control={form.control}
                name="gender"
                data={["Laki-laki", "Perempuan"]}
                defaultValue={form.getValues().gender}
                label="Jenis Kelamin"
                placeholder="Pilih jenis kelamin"
              />

              <DialogInput
                control={form.control}
                name="NRP"
                placeholder="Masukkan NRP"
                label="NRP"
                type="number"
              />

              {isLoading ? (
                <div className="text-center py-2">Memuat data pangkat...</div>
              ) : (
                <Dropdown
                  control={form.control}
                  name="rank"
                  data={convertToDropdownFormat(rank)}
                  label="Pangkat"
                  placeholder="Pilih Pangkat"
                  onValueChange={handleSelectRank}
                />
              )}

              {isLoading ? (
                <div className="text-center py-2">Memuat data jabatan...</div>
              ) : (
                <Dropdown
                  control={form.control}
                  name="position"
                  data={convertToDropdownFormat(position)}
                  label="Jabatan"
                  placeholder="Pilih Jabatan"
                  onValueChange={handleSelectPosition}
                />
              )}

              {isLoading ? (
                <div className="text-center py-2">Memuat data subsatker...</div>
              ) : (
                <Dropdown
                  control={form.control}
                  name="subSatKer"
                  data={convertToDropdownFormat(subSatKer)}
                  label="SubSatKer"
                  placeholder="Pilih SubSatKer"
                  onValueChange={handleSelectSubSatKer}
                />
              )}

              {isLoading ? (
                <div className="text-center py-2">Memuat data subdit...</div>
              ) : (
                <Dropdown
                  control={form.control}
                  name="subDit"
                  data={convertToDropdownFormat(subDit)}
                  label="SubDit"
                  placeholder="Pilih SubDit"
                  onValueChange={handleSelectSubDit}
                />
              )}

              <Dropdown
                control={form.control}
                name="BKO"
                data={convertToDropdownFormat(data_bko)}
                label="BKO"
                placeholder="Pilih BKO"
                onValueChange={handleSelectBKO}
              />

              <Dropdown
                control={form.control}
                name="status"
                data={convertToDropdownFormat(data_status)}
                label="Status"
                placeholder="Pilih Status"
                onValueChange={handleSelectStatus}
              />

              <DialogFooter>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      )}
    </DialogContent>
  );
};

export default DialogFormBody;
