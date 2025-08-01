import { UserRole } from "@/hooks/useAuth/types";
import useAuth from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

interface PrivateRoutesProps {
  allowedRoles?: UserRole[];
}

const PrivateRoutes = ({ allowedRoles }: PrivateRoutesProps) => {
  const { isAuthenticated, hasRole } = useAuth();

  // Pertama cek apakah user sudah login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Jika ada roles yang ditentukan, cek apakah user memiliki role tersebut
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = hasRole(allowedRoles);

    // Jika tidak punya akses, redirect ke halaman unauthorized
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Jika user terautentikasi dan memiliki akses, tampilkan konten
  return <Outlet />;
};

export default PrivateRoutes;