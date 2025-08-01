import {
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";
import formSchema from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DialogStateEnum from "@/components/Dialog/state";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import SuccessDialog from "@/components/Dialog/SuccessDialog";
import ErrorDialog from "@/components/Dialog/ErrorDialog";
import DialogInput from "./input";
import { Button } from "@/components/ui/button";
import { useSWRConfig } from "swr";
import useGetPersonnel from "@/routes/PersonelPage/hooks/useGetPersonnel";
import { Personnel } from "@/routes/PersonelPage/hooks/useGetPersonnel/types";
import usePostCreateOrganization from "@/routes/OrganizationalStructurePage/hooks/usePostCreateOrganization";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateOrganizationDialog = () => {
  const { mutate } = useSWRConfig();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const { listPersonnel } = useGetPersonnel({
    page: 1,
    limit: 2000000,
  });

  const [isLoadingState, setIsLoadingState] = useState(false);
  const [dialogState, setDialogState] = useState<DialogStateEnum>(
      DialogStateEnum.form
  );
  const [personnel, setPersonnel] = useState<Personnel | undefined>();

  // Get the createOrganization function from the hook
  const { createOrganization } = usePostCreateOrganization();

  const onButtonSave = async () => {
    if (dialogState === DialogStateEnum.form) {
      setDialogState(DialogStateEnum.confirm);
      return;
    }
    setIsLoadingState(true);
    const formValues = form.getValues();
    createOrganization({
      organizationName: formValues.chartTitle,
      personnelId: personnel?.id ?? "",
    })
        .then((_) => {
          setDialogState(DialogStateEnum.success);
          mutate(`/organizational-structure/chart/`);
        })
        .catch(() => {
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
    setPersonnel(undefined);
    form.reset();
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
            <ErrorDialog message="Gagal menyimpan data" />
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
              <DialogTitle>Tambah Struktur Divisi</DialogTitle>

              <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onButtonSave)}
                    className="grid gap-4 py-4"
                >
                  <DialogInput
                      control={form.control}
                      name="chartTitle"
                      placeholder="Masukkan nama divisi"
                      label="Nama Divisi"
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel>Nama</FormLabel>
                        <div className="col-span-3">
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              const selectedPersonnel = listPersonnel?.find(p => p.nama === value);
                              if (selectedPersonnel) {
                                setPersonnel(selectedPersonnel);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Anggota" />
                            </SelectTrigger>
                            <SelectContent>
                              {(listPersonnel || []).map((item) => (
                                <SelectItem key={item.id} value={item.nama}>
                                  {item.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="mt-2" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-4 items-center gap-4">
                    <h1>Jabatan: </h1>
                    <h1 className="col-span-3">{personnel?.jabatan ?? "-"}</h1>
                  </div>

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

export default CreateOrganizationDialog;

