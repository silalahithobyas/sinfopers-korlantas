import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import usePostPersonnel from "@/routes/PersonelPage/hooks/usePostPersonnel";
import personnelFormSchema from "@/routes/PersonelPage/entities/formSchema";
import { PersonnelDataInterface } from "@/routes/PersonelPage/hooks/types";
import DialogFormBody from "./DialogFormBody";

interface dataUser {
  id:string,
  initialName: string
}
const DialogFormContent = ({id, initialName}:dataUser) => {
  const form = useForm<z.infer<typeof personnelFormSchema>>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: {},
  });

  const handlePostPersonnel = async ({
    nama,
    jenis_kelamin,
    nrp,
    status,
    jabatan,
    pangkat,
    subsatker,
    subdit,
    bko,
  }: PersonnelDataInterface) => {
    await usePostPersonnel({
      nama,
      jenis_kelamin,
      nrp,
      status,
      jabatan,
      pangkat,
      subsatker,
      subdit,
      bko,
    });
  };

  return <DialogFormBody form={form} onAction={handlePostPersonnel} id={id} initialNama={initialName} />;
};

export default DialogFormContent;
