import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import personnelFormSchema from "@/routes/PersonelPage/entities/formSchema";
import { Personnel } from "@/routes/PersonelPage/hooks/useGetPersonnel/types";
import usePutPersonnel from "@/routes/PersonelPage/hooks/usePutPersonnel";
import DialogBody from "../components/DialogBody";
import { PersonnelDataInterface } from "@/routes/PersonelPage/hooks/types";

interface Props {
  personnel: Personnel;
  onComplete?: () => void;
}

const EditDialog = ({ personnel, onComplete }: Props) => {
  const form = useForm<z.infer<typeof personnelFormSchema>>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: {
      name: personnel.nama,
      gender: personnel.jenis_kelamin
        .replace("L", "Laki-laki")
        .replace("P", "Perempuan"),
      NRP: personnel.nrp,
      rank: personnel.pangkat,
      position: personnel.jabatan,
      subSatKer: personnel.subsatker,
      subDit: personnel.subdit,
      BKO: personnel.bko,
      status: personnel.status,
    },
  });

  const handlePutPersonnel = async ({
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
  }: PersonnelDataInterface) => {
    await usePutPersonnel({
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
    });
  };

  return (
    <DialogBody
      personnel={personnel}
      form={form}
      onAction={handlePutPersonnel}
      onComplete={onComplete}
    />
  );
};

export default EditDialog;
