// routes/InformationPage/components/InformationCard.tsx
import React from 'react';
import useAuth from '@/hooks/useAuth';
import axiosClient from '@/networks/apiClient';
import { toast } from "react-toastify";
import { UserRole } from "@/hooks/useAuth/types";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { CalendarDays, Clock, FileText, Edit, Trash2, History, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  info: {
    information_id: string;
    penulis_username: string;
    information_title: string;
    information_context: string;
    file_pendukung: string | null;
    date_created: string;
    date_updated: string;
  };
  onDeleted: () => void;
  onEdit: (info: Props["info"]) => void;
}

const formatTanggal = (isoString: string) => {
  const tanggal = new Date(isoString);
  return tanggal.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const InformationCard: React.FC<Props> = ({ info, onDeleted, onEdit }) => {
  const { username, role } = useAuth();
  const isEditable = role === UserRole.HR && username === info.penulis_username;

  const [logs, setLogs] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/information/${info.information_id}/logs/`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (info: Props["info"]) => {
    const confirm = window.confirm("Yakin ingin menghapus informasi ini?");
    if (!confirm) return;

    try {
      await axiosClient.delete(`/information/${info.information_id}/`);
      toast.success("Informasi berhasil dihapus");
      onDeleted();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus informasi");
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
      <div className="border-b border-gray-100 bg-blue-50 px-6 py-4">
      <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-blue-800">{info.information_title}</h2>
          {isEditable && (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => onEdit(info)}
              >
                <Edit size={16} className="mr-1" /> Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => handleDelete(info)}
              >
                <Trash2 size={16} className="mr-1" /> Hapus
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <div className="flex items-center mr-4">
            <User size={14} className="mr-1 text-blue-600" />
            <span>
              Ditulis oleh <span className="font-semibold">{info.penulis_username}</span>
            </span>
          </div>

          <div className="flex items-center mr-4">
            <CalendarDays size={14} className="mr-1 text-green-600" />
            <span>Dibuat: {formatTanggal(info.date_created)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock size={14} className="mr-1 text-amber-600" />
            <span>Diperbarui: {formatTanggal(info.date_updated)}</span>
          </div>
        </div>

        <div className="prose my-4 max-w-none text-gray-700 whitespace-pre-line">
        {info.information_context}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
      {info.file_pendukung && (
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50"
              asChild
            >
          <a
            href={info.file_pendukung}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
                <Download size={14} className="mr-2" />
            Unduh Lampiran PDF
          </a>
            </Button>
      )}

        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (isOpen && logs.length === 0) {
            fetchLogs();
          }
        }}>
          <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                <History size={14} className="mr-2" />
              Lihat Riwayat
              </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Riwayat Perubahan</DialogTitle>
              <DialogDescription>
                Riwayat edit dari informasi ini ditampilkan di bawah.
              </DialogDescription>
            </DialogHeader>

            {loading ? (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-gray-500">Memuat riwayat...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-6 border rounded-lg bg-gray-50">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Belum ada riwayat perubahan.</p>
                </div>
            ) : (
                <ul className="space-y-4 mt-4">
                {logs.map((log, idx) => (
                    <li key={idx} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{log.user_username}</div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${log.action === 'update' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                          {log.action === 'update' ? 'Update' : 'Delete'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                      {new Date(log.timestamp).toLocaleString("id-ID")}
                      </div>
                      <div className="text-sm mt-1 italic text-gray-600">
                        {log.detail || "Tidak ada detail."}
                      </div>
                  </li>
                ))}
              </ul>
            )}

            <DialogClose asChild>
                <Button className="mt-4">
                Tutup
                </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default InformationCard;
