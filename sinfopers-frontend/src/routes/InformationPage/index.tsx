// routes/InformationPage/index.tsx
import React, { useEffect, useState } from 'react';
import axiosClient from '@/networks/apiClient';
import InformationCard from './components/InformationCard';
import AddOrEditModal from './components/AddOrEditModal';
import useAuth from '@/hooks/useAuth';
import { Navbar, NavbarPageEnum } from "@/components/Navbar";
import DefaultContainer from "@/components/DefaultContainer";
import FooterCopyright from "@/components/FooterCopyright";
import { Loader2, Plus, Search, RefreshCw, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toaster";

interface Information {
  information_id: string;
  penulis_username: string;
  information_title: string;
  information_context: string;
  file_pendukung: string | null;
  date_created: string;
  date_updated: string;
}

const InformationPage: React.FC = () => {
  const [information, setInformation] = useState<Information[]>([]);
  const [filteredInfo, setFilteredInfo] = useState<Information[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [editInfo, setEditInfo] = useState<Information | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { role } = useAuth();

  const fetchData = () => {
    setLoading(true);
    setError(null);
    axiosClient
      .get(`/information/?page=${page}`)
      .then((res) => {
        console.log("Response API:", res.data);
        
        let infoData: Information[] = [];
        
        if (res.data && Array.isArray(res.data)) {
          // Format respons berupa array langsung
          infoData = res.data;
          setCount(Math.ceil(res.data.length / 10));
        } else if (res.data && res.data.results) {
          // Format respons dengan property results
          infoData = res.data.results;
          setCount(Math.ceil(res.data.count / 10));
        } else if (res.data && res.data.data) {
          // Format respons dengan property data
          infoData = res.data.data;
          setCount(Math.ceil(res.data.data.length / 10));
        } else {
          // Jika format respons tidak sesuai harapan
          console.error('Format respons tidak sesuai harapan:', res.data);
        }
        
        setInformation(infoData);
        setFilteredInfo(infoData);
      })
      .catch((err) => {
        console.error('Error fetching information:', err);
        setError('Gagal memuat data informasi. Silakan coba lagi nanti.');
        setInformation([]);
        setFilteredInfo([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    let filtered = information;

    // Filter berdasarkan search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (info) =>
          info.information_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          info.information_context.toLowerCase().includes(searchQuery.toLowerCase()) ||
          info.penulis_username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter berdasarkan range tanggal
    if (startDate || endDate) {
      filtered = filtered.filter((info) => {
        const infoDate = new Date(info.date_created);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Set waktu untuk perbandingan yang akurat
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        
        const infoDateOnly = new Date(infoDate);
        infoDateOnly.setHours(0, 0, 0, 0);

        if (start && end) {
          return infoDateOnly >= start && infoDateOnly <= end;
        } else if (start) {
          return infoDateOnly >= start;
        } else if (end) {
          return infoDateOnly <= end;
        }
        return true;
      });
    }

    setFilteredInfo(filtered);
  }, [searchQuery, startDate, endDate, information]);

  const handleDeleted = () => fetchData();
  const handleEdit = (info: Information) => {
    setEditInfo(info);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditInfo(null);
    setModalOpen(true);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const hasDateFilter = startDate || endDate;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar page={NavbarPageEnum.information} />
      
      <div className="flex-1 w-full flex flex-col">
        <DefaultContainer>
          <div className="flex justify-between items-center w-full mb-6">
            <div>
              <h1 className="text-3xl font-bold">Informasi</h1>
              <p className="text-gray-500 mt-1">Pengumuman dan berita terbaru</p>
            </div>
            {role === 'hr' && (
              <Button onClick={handleAdd} className="bg-green-500 hover:bg-green-600">
                <Plus className="mr-2 h-4 w-4" /> Tambah Informasi
              </Button>
            )}
          </div>
          
          <div className="w-full mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Cari informasi berdasarkan judul, konten, atau penulis..."
                  className="pl-10 border-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2" 
                onClick={handleRefresh}
              >
                <RefreshCw size={16} /> Refresh
              </Button>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-600" size={18} />
                <span className="text-sm font-medium text-gray-700">Filter Tanggal:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Dari:</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto border-gray-300"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sampai:</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto border-gray-300"
                />
              </div>

              {hasDateFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDateFilter}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <X size={14} />
                  Hapus Filter
                </Button>
              )}
            </div>

            {/* Filter Status */}
            {(searchQuery || hasDateFilter) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Menampilkan {filteredInfo.length} dari {information.length} informasi</span>
                {searchQuery && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Pencarian: "{searchQuery}"
                  </span>
                )}
                {hasDateFilter && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    Filter Tanggal: {startDate || "..."} - {endDate || "..."}
                  </span>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="w-full flex justify-center my-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-800" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
              <p className="flex items-center">
                <span className="font-bold mr-2">Error:</span> {error}
              </p>
            </div>
          ) : filteredInfo.length > 0 ? (
            <div className="w-full space-y-6">
              {filteredInfo.map((info) => (
                <InformationCard
                  key={info.information_id}
                  info={info}
                  onDeleted={handleDeleted}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border rounded-lg w-full">
              <p className="text-gray-500 text-lg">
                {searchQuery || hasDateFilter 
                  ? "Tidak ada informasi yang sesuai dengan filter yang dipilih." 
                  : "Belum ada informasi yang tersedia."
                }
              </p>
              {role === 'hr' && !searchQuery && !hasDateFilter && (
                <Button onClick={handleAdd} className="mt-4 bg-blue-800 hover:bg-blue-900">
                  Tambah Informasi Pertama
                </Button>
              )}
            </div>
          )}

          {!loading && filteredInfo.length > 0 && (
            <div className="flex justify-between items-center mt-8 w-full">
              <Button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="bg-blue-800 hover:bg-blue-900 disabled:opacity-50"
              >
                Previous
              </Button>
              <span className="font-medium">Halaman {page} dari {count}</span>
              <Button
                onClick={() => setPage((prev) => Math.min(count, prev + 1))}
                disabled={page === count}
                className="bg-blue-800 hover:bg-blue-900 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </DefaultContainer>
      </div>
      
      <FooterCopyright />
      <Toaster />

      {modalOpen && (
        <AddOrEditModal
          info={editInfo}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default InformationPage;
