import { useState, useRef } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileSpreadsheet, Upload, X } from "lucide-react";
import axiosClient from "@/networks/apiClient";
import { toast } from "@/components/ui/use-toast";

interface ImportResult {
  success: boolean;
  data?: {
    message: string;
    total: number;
    success: number;
    failed: number;
    errors: string[];
  };
  error?: string;
}

interface Props {
  onSuccess: () => void;
}

const ImportPersonelDialog = ({ onSuccess }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null); // Reset hasil saat file berubah
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0] || null;
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setResult(null); // Reset hasil saat file berubah
    } else {
      toast({
        title: "Format file tidak valid",
        description: "Hanya file CSV yang dapat di-impor",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "File belum dipilih",
        description: "Pilih file CSV yang akan di-impor",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosClient.post("/personil/import/?type=personil", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult({
        success: true,
        data: response.data.data,
      });

      if (response.data.data.failed === 0) {
        toast({
          title: "Import berhasil",
          description: `Berhasil meng-impor ${response.data.data.success} dari ${response.data.data.total} data personel`,
        });
        
        // Tutup dialog jika tidak ada error dan refresh halaman
        setTimeout(() => {
          onSuccess();
          // Auto-refresh halaman
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error importing data:", error);
      setResult({
        success: false,
        error: error.response?.data?.message || "Terjadi kesalahan saat meng-impor data",
      });
      
      toast({
        title: "Import gagal",
        description: error.response?.data?.message || "Terjadi kesalahan saat meng-impor data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplateCSV = () => {
    // Header dan contoh baris data
    const header = "NAMA,NRP,PANGKAT,JABATAN,JENIS_KELAMIN,SUBSATKER,SUBDIT,BKO,STATUS,USERNAME";
    const exampleRow = "John Doe,12345678,IPDA,KAPOLSEK,L,DITLANTAS,SUBDIT GAKKUM,\"-\",Aktif,user123";
    const note = "# CATATAN: User dengan username yang ditentukan harus sudah ada di sistem dan belum terhubung dengan personil lain (Hapus row ini sebelum meng-impor)";
    
    const csvContent = [note, header, exampleRow].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_personel.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>Import Data Personel</DialogTitle>
        <DialogDescription>
          Unggah file CSV yang berisi data personel untuk di-impor ke dalam sistem.
          <br /><br />
          <span className="text-red-500 font-semibold">PENTING:</span> Pastikan kolom USERNAME dalam CSV berisi username dari user yang sudah terdaftar dan belum terhubung dengan personil manapun.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 space-y-4">
        <Button 
          variant="outline" 
          onClick={downloadTemplateCSV}
          className="w-full flex items-center justify-center"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Download Template CSV
        </Button>
        
        {/* File upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            file ? "border-primary" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary"
                >
                  <span>Pilih file CSV</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">atau tarik dan letakkan</p>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Hanya file CSV yang didukung
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileSpreadsheet className="h-8 w-8 text-primary mr-2" />
                <div className="text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-gray-500 hover:text-red-500"
                title="Hapus file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Hasil import */}
        {result && (
          <div className="mt-4">
            {result.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-lg">{result.data?.total}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Berhasil</p>
                    <p className="text-lg text-green-800">{result.data?.success}</p>
                  </div>
                  <div className="bg-red-100 p-2 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Gagal</p>
                    <p className="text-lg text-red-800">{result.data?.failed}</p>
                  </div>
                </div>

                {result.data?.errors && result.data.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Error:</p>
                    <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded-md">
                      {result.data.errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-600 mb-1">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onSuccess} 
          disabled={loading}
        >
          Batal
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={!file || loading}
        >
          {loading ? "Meng-impor..." : "Import Data"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ImportPersonelDialog; 