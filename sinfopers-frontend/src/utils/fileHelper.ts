// Utility untuk menangani URL file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Mengubah path file relatif menjadi URL absolut
 * @param filePath - Path file dari backend (biasanya berupa 'media/permohonan/file.pdf')
 * @returns URL lengkap dari file
 */
export const getFileUrl = (filePath: string | null): string | null => {
  if (!filePath) return null;
  
  // Jika sudah berupa URL lengkap, kembalikan apa adanya
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Jika path dimulai dengan 'media/', tambahkan base URL
  if (filePath.startsWith('media/')) {
    return `${API_BASE_URL}/${filePath}`;
  }
  
  // Jika tidak ada prefix, asumsikan ini adalah path relatif dari media root
  return `${API_BASE_URL}/media/${filePath}`;
};

// Fungsi untuk membuka file dalam tab baru
export const openFileInNewTab = (filePath: string | null): void => {
  const url = getFileUrl(filePath);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// Fungsi untuk menampilkan nama file dari path
export const getFileNameFromPath = (filePath: string | null): string => {
  if (!filePath) return 'Tidak ada file';
  
  // Ekstrak nama file dari path
  const pathParts = filePath.split('/');
  return pathParts[pathParts.length - 1];
}; 