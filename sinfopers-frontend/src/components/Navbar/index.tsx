// src/components/Navbar/index.tsx
import policeYellow from "@/assets/police-1.png";
import policeWhite from "@/assets/police-2.png";
import { Button } from "../ui/button";
import NavbarItem from "./NavbarItem";
import useAuth from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { UserRole } from "@/hooks/useAuth/types";

export enum NavbarPageEnum {
    information = "Informasi",
    userManagement = "Manajemen User",
    personnelDatabase = "Data Personil",
    permohonan = "Permohonan",
    staffingStatus = "Staffing Status",
    organizationalStructure = "Struktur Divisi",
    myData = "Profile Pribadi",
}

interface Props {
    page: NavbarPageEnum;
}

// Function untuk mendapatkan label role yang lebih user-friendly
const getRoleLabel = (role?: string): string => {
    // Tambahkan logging untuk debug
    console.log("Getting role label for:", role);

    if (!role) return "Pengguna";

    switch (role.toLowerCase()) {
        case UserRole.ADMIN:
            return "Admin";
        case UserRole.HR:
            return "HR";
        case UserRole.PIMPINAN:
            return "Pimpinan";
        case UserRole.ANGGOTA:
            return "Anggota";
        default:
            return "Pengguna";
    }
};

const Navbar = ({ page }: Props) => {
    const { logoutAccount, username, role } = useAuth();
    console.log("Navbar Received:", { username, role });

    const pages = Object.values(NavbarPageEnum);

    const handleLogout = () => {
        logoutAccount();
    };

    return (
        <div className="flex w-full bg-blue-800 items-center px-8 py-3 shadow-md">
            <div className="flex items-center gap-4">
                <img src={policeYellow} alt="Logo Polisi" className="w-14 h-14 object-contain" />
                <img src={policeWhite} alt="Logo Polantas" className="w-14 h-14 object-contain" />
                <div className="hidden md:block">
                    <h1 className="font-bold text-yellow-400 text-lg">POLANTAS</h1>
                    <p className="text-yellow-300 text-xs">Sistem Informasi Personil</p>
                </div>
            </div>

            <div className="flex mx-auto bg-blue-900 rounded-full overflow-hidden shadow-inner">
                {pages.map((item) => (
                    <NavbarItem key={item} page={page} type={item} />
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end text-yellow-300">
                    <span className="font-semibold text-sm">{username || "Pengguna"}</span>
                    <span className="text-xs opacity-80">{getRoleLabel(role)}</span>
                </div>
                <Button
                    variant="outline"
                    className="bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-blue-800 transition-colors font-medium rounded-lg flex items-center gap-2"
                    onClick={handleLogout}
                >
                    <LogOut size={16} />
                    <span className="hidden md:inline">Keluar</span>
                </Button>
            </div>
        </div>
    );
};

// Hanya export Navbar karena NavbarPageEnum sudah di-export di level modul
export { Navbar };