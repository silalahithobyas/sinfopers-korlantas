import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

// Helper untuk debouncing notifikasi error yang sama
let lastErrorMessage = "";
let lastErrorTime = 0;

// Menentukan baseURL berdasarkan environment
const getBaseURL = () => {
  // Prioritaskan nilai dari .env
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log("Menggunakan API URL dari .env:", import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  const prodDomain = "sinfopers.my.id";
  const isDevelopment = !window.location.hostname.includes(prodDomain);
  
  // Jika di development dan tidak ada .env, gunakan localhost
  if (isDevelopment) {
    console.log("Menggunakan API URL development (localhost)");
    return "http://127.0.0.1:8000/api/v1";
  }
  
  // Fallback untuk production jika tidak ada .env
  console.log("Menggunakan API URL production (fallback)");
  return "https://sinfopers.my.id/api/v1";
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Menambahkan timeout untuk menghindari menunggu terlalu lama
  timeout: 10000,
});

// Interceptor for authentication
axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get("jwt_token");

  console.log("JWT Token dari cookie:", token ? "Ada (tidak kosong)" : "Tidak ada (kosong)");
  
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Request URL:", config.url);
    console.log("Auth header ditambahkan:", `Bearer ${token.substring(0, 15)}...`);
  } else {
    console.warn("Token tidak ditemukan di cookies, request tidak menyertakan Authorization header");
  }
  
  // Tambahkan timestamp untuk menghindari cache
  const separator = config.url?.includes('?') ? '&' : '?';
  config.url = `${config.url}${separator}_t=${new Date().getTime()}`;
  
  return config;
});

// Handle 401 error
axiosClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      // Jangan log error jika sama dengan error sebelumnya dalam 3 detik terakhir
      const now = Date.now();
      const errorMessage = error.message + (error.response?.status || '');
      
      if (errorMessage !== lastErrorMessage || now - lastErrorTime > 3000) {
        lastErrorMessage = errorMessage;
        lastErrorTime = now;
        
        console.error("Response error:", error.message);
        console.error("Status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      }
      
      if (error.response && error.response.status === 401) {
        console.warn("401 Unauthorized - akan logout dan redirect");
        // Hapus cookie JWT dan redirect ke login hanya jika belum di halaman login
        if (!window.location.pathname.includes('/auth')) {
          Cookies.remove("jwt_token");
          window.location.href = "/auth";
        }
      }

      // Tambahkan informasi ke error untuk memudahkan debugging
      if (error.response && error.response.data) {
        const responseData = error.response.data as Record<string, any>;
        error.message = 
          (responseData.detail as string | undefined) || 
          (responseData.message as string | undefined) || 
          error.message;
      }

      return Promise.reject(error);
    }
);

export default axiosClient;