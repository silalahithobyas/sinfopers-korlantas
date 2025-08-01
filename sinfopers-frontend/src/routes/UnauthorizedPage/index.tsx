// src/routes/UnauthorizedPage/index.tsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Akses Dibatasi</h1>
                </div>

                <p className="text-gray-600 mb-6">
                    Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Permintaan
                    akses ini memerlukan level otorisasi yang lebih tinggi.
                </p>

                <div className="flex flex-col space-y-3">
                    <Button
                        onClick={() => navigate("/organization-structure")}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        Kembali ke Struktur Divisi
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="w-full"
                    >
                        Kembali ke Halaman Sebelumnya
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;