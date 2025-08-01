// src/components/Navbar/NavbarItem/index.tsx
import { useNavigate } from "react-router-dom";
import { NavbarPageEnum } from "..";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";

interface Props {
  type: NavbarPageEnum;
  page: NavbarPageEnum;
}

const NavbarItem = ({ type, page }: Props) => {
  const isSelected = type === page;
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // Jika ini tab manajemen user dan user bukan admin, jangan tampilkan
  if (type === NavbarPageEnum.userManagement && !hasRole([UserRole.ADMIN])) {
    return null;
  }

  if (type === NavbarPageEnum.myData && !hasRole([UserRole.ANGGOTA, UserRole.PIMPINAN])){
    return null;
  }

  if (type === NavbarPageEnum.myData && hasRole([UserRole.ADMIN])){
    return null;
  }

  if(type === NavbarPageEnum.personnelDatabase && hasRole([UserRole.ANGGOTA])){
    return null;
  }

  // Permohonan untuk Anggota, HR, dan Pimpinan
  if(type === NavbarPageEnum.permohonan && !hasRole([UserRole.ANGGOTA, UserRole.HR, UserRole.PIMPINAN])){
    return null;
  }

  // Staffing Status hanya untuk Admin, HR, dan Pimpinan
  if(type === NavbarPageEnum.staffingStatus && !hasRole([UserRole.ADMIN, UserRole.HR, UserRole.PIMPINAN])){
    return null;
  }

  const onNavigate = () => {
    switch (type) {
      case NavbarPageEnum.personnelDatabase: {
        navigate("/personnel");
        break;
      }
      case NavbarPageEnum.staffingStatus: {
        navigate("/staffing-status");
        break;
      }
      case NavbarPageEnum.organizationalStructure: {
        navigate("/organization-structure");
        break;
      }
      case NavbarPageEnum.userManagement: {
        navigate("/user-management");
        break;
      }
      case NavbarPageEnum.myData: {
        navigate("/my-data-personel");
        break;
      }
      case NavbarPageEnum.permohonan: {
        navigate("/permohonan");
        break;
      }
      case NavbarPageEnum.information: {
        navigate("/information");
        break;
      }
    }
  };

  return (
      <button
          className={`px-5 py-2 transition-all duration-200 relative text-sm md:text-base font-medium
        ${isSelected
              ? "text-yellow-400 font-semibold"
              : "text-yellow-100 hover:text-white"
          }`}
          onClick={onNavigate}
      >
        {type}
        {isSelected && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400 rounded-t-md"></div>
        )}
      </button>
  );
};

export default NavbarItem;