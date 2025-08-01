import React, { useState, useEffect } from "react";
import axiosClient from "@/networks/apiClient";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Upload, X, Save, FileText } from "lucide-react";

interface Props {
  info: {
    information_id: string;
    information_title: string;
    information_context: string;
    file_pendukung: string | null;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddOrEditModal: React.FC<Props> = ({ info, onClose, onSuccess }) => {
  const isEdit = !!info;

  const [title, setTitle] = useState(info?.information_title || "");
  const [context, setContext] = useState(info?.information_context || "");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(info?.information_title || "");
    setContext(info?.information_context || "");
    setFile(null);
    setFileName("");
  }, [info]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setFileName(selectedFile?.name || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !context.trim()) {
      setError("Judul dan konten tidak boleh kosong.");
      return;
    }

    const confirmed = window.confirm(
      isEdit ? "Apakah Anda yakin ingin menyimpan perubahan?" : "Apakah Anda yakin ingin menambahkan informasi ini?"
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("information_title", title);
    formData.append("information_context", context);
    if (file) {
      formData.append("file_pendukung", file);
    }

    try {
      if (isEdit && info) {
        await axiosClient.patch(`/information/${info.information_id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Informasi berhasil diperbarui");
      } else {
        await axiosClient.post("/information/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Informasi berhasil ditambahkan");
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan informasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? "Edit Informasi" : "Tambah Informasi Baru"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Judul
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul informasi"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="font-medium">
              Konten
            </Label>
            <Textarea
              id="content"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Masukkan konten informasi"
              className="w-full min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="font-medium">
              File Pendukung (PDF) – Opsional
            </Label>
            
            <div className="flex items-center">
              <div className="border border-dashed rounded-md p-3 flex-1 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
                <input
                  type="file"
                  id="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                />
                
                <div className="flex flex-col items-center justify-center text-center p-4">
                  {fileName ? (
                    <>
                      <FileText className="h-8 w-8 text-blue-800 mb-2" />
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {fileName}
                      </span>
                      <span 
                        className="text-xs text-red-500 mt-1 cursor-pointer flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFile(null);
                          setFileName("");
                        }}
                      >
                        <X size={12} className="mr-1" /> Hapus
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-500">
                        Klik untuk upload file atau tarik file kemari
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        Hanya file PDF yang diizinkan
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-800 hover:bg-blue-900 text-yellow-300"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEdit ? "Simpan Perubahan" : "Tambah Informasi"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrEditModal;
