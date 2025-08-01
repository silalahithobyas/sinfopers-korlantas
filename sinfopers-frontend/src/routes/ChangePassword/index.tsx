"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Lock, Shield, KeyRound } from "lucide-react";
import axiosClient from "@/networks/apiClient";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Navbar, NavbarPageEnum } from "@/components/Navbar";

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password baru harus minimal 8 karakter");
      return;
    }

    try {
      setIsLoading(true);
      await axiosClient.post("/auth/users/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      toast.success("Password berhasil diubah");

      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("username");
      sessionStorage.clear(); 
      navigate("/auth"); // Arahkan ke halaman setelah berhasil
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 400) {
          setError(err.response.data.message || "Gagal mengubah password");
        } else if (err.response.status === 401) {
          setError("Password lama salah");
        }
      } else {
        setError("Terjadi kesalahan pada server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      <Navbar page={NavbarPageEnum.myData} />
      <div className="my-4 md:my-8 mx-2 md:mx-20 lg:mx-28 flex flex-col items-center justify-start">
        <div className="w-full max-w-xl mx-auto">
      <Link
            to="/my-data-personel"
            className="flex items-center text-blue-700 hover:text-blue-800 mb-4 transition-colors"
      >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Kembali</span>
      </Link>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-700 px-6 py-4">
              <h2 className="font-bold text-xl md:text-2xl text-white flex items-center">
                <KeyRound className="mr-2 h-5 w-5" />
          Ganti Password
        </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-500" />
                  <span>{error}</span>
          </div>
        )}

        {/* Password Lama */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <Lock className="h-5 w-5 mr-2 text-blue-600" />
                  Password Lama
                </label>
        <div className="relative">
          <input
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
                    placeholder="Masukkan password lama"
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
                </div>
        </div>

        {/* Password Baru */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <Lock className="h-5 w-5 mr-2 text-blue-600" />
                  Password Baru
                </label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={8}
                    placeholder="Minimal 8 karakter"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
                </div>
        </div>

        {/* Konfirmasi Password Baru */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <Lock className="h-5 w-5 mr-2 text-blue-600" />
            Konfirmasi Password Baru
          </label>
                <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={8}
                    placeholder="Masukkan ulang password baru"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
                </div>
        </div>

              <div className="pt-2">
        <button
          type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-md transition-colors shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-5 w-5" />
                      Simpan Password Baru
                    </>
                  )}
        </button>
              </div>
      </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
