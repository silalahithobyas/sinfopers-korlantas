// src/routes/OrganizationalStructurePage/components/Toolbar/index.tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DownloadIcon, Plus, Trash } from "lucide-react";
import CreateOrganizationDialog from "../Dialog/CreateOrganizationDialog";
import { Organization } from "../../types";
import DeleteOrganizationDialog from "../Dialog/DeleteOrganizationDialog";
import { Dispatch, SetStateAction, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";

interface Props {
  data: Organization[];
  selected?: string;
  onFilterChange: (value: string) => void;
  handleCapture: () => void;
  setFileName: Dispatch<SetStateAction<string>>;
}

const Toolbar = ({
                   data,
                   selected,
                   onFilterChange,
                   handleCapture,
                   setFileName,
                 }: Props) => {
  const { hasRole } = useAuth();
  const isHR = hasRole([UserRole.HR]);

  useEffect(() => {
    if (data.length === 0) return;
    const newest = data[data.length - 1].id;
    const newestName = data[data.length - 1].nama;
    setFileName(newestName);
    onFilterChange(newest.toString());
  }, [data]);

  return (
      <div className="flex w-full justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl text-indigo-900 font-bold pb-2">
            Pilih Divisi
          </h1>
          <Select onValueChange={onFilterChange} value={selected}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Divisi" />
            </SelectTrigger>

            <SelectContent>
              {data.map((org) => {
                return (
                    <SelectItem
                        key={org.id}
                        onSelect={() => setFileName(org.nama)}
                        value={org.id.toString()}
                    >
                      {org.nama}
                    </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          {/* Hanya tampilkan tombol tambah/hapus jika user adalah HR */}
          {isHR && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mr-6">
                      <Plus className="mr-2" /> Tambah Divisi
                    </Button>
                  </DialogTrigger>
                  <CreateOrganizationDialog />
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="mr-6">
                      <Trash className="mr-2" /> Hapus Divisi
                    </Button>
                  </DialogTrigger>
                  <DeleteOrganizationDialog id={selected ?? ""} />
                </Dialog>
              </>
          )}

          <Button className="px-8" onClick={handleCapture}>
            <DownloadIcon className="mr-2" /> Unduh
          </Button>
        </div>
      </div>
  );
};

export default Toolbar;