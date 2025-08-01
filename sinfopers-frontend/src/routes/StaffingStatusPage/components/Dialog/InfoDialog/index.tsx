import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

interface Props {
  title: string;
  message: string;
}

const InfoDialog = ({ title, message }: Props) => {
  const isOverstaffed = title.includes("Kelebihan");
  
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <DialogTitle className="text-red-600 font-bold text-lg">{title}</DialogTitle>
        </div>
      </DialogHeader>
      
      <div className="mt-2 space-y-3">
        <p className="text-gray-700">
          {isOverstaffed ? (
            <span>
              Jumlah personil <span className="font-semibold">melebihi DSP</span> yang telah ditetapkan. 
              Hal ini dapat menyebabkan inefisiensi dalam penugasan dan distribusi sumber daya.
            </span>
          ) : (
            <span>
              Jumlah personil <span className="font-semibold">kurang dari DSP</span> yang ditetapkan.
              Hal ini dapat menyebabkan beban kerja berlebih pada personil yang ada.
            </span>
          )}
        </p>
        
        <div className="p-3 bg-neutral-100 rounded-md">
          <p className="text-sm text-gray-600 font-medium mb-1">Catatan:</p>
          <p className="text-sm">{message}</p>
        </div>
        
        <div className="text-sm text-gray-600 italic">
          Silakan hubungi Bagian SDM untuk tindak lanjut terkait {isOverstaffed ? "kelebihan" : "kekurangan"} personil ini.
        </div>
      </div>
    </DialogContent>
  );
};

export default InfoDialog;
