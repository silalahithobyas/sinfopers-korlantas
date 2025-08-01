// src/routes/index.tsx
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./PersonelPage";
import AuthenticationPage from "./AuthenticationPage";
import OrganizationStructurePage from "./OrganizationalStructurePage";
import UserManagementPage from "./UserManagementPage";
import PrivateRoutes from "@/components/PrivateRoutes";
import { UserRole } from "@/hooks/useAuth/types";
import UnauthorizedPage from "./UnauthorizedPage";
import MyDataPersonel from "./MyDataPersonel";
import PermohonanPage from "./PermohonanPage";
import ChangePassword from "./ChangePassword";
import StaffingStatusPage from "./StaffingStatusPage";
import InformationPage from "./InformationPage";


const MainRoutes = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthenticationPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Redirect root to organization-structure page */}
            <Route path="/" element={<Navigate to="/information" replace />} />

            {/* Routes only for Admin, HR, and Pimpinan */}
            <Route element={<PrivateRoutes allowedRoles={[UserRole.ADMIN, UserRole.HR, UserRole.PIMPINAN]} />}>
                <Route path="/personnel" element={<HomePage />} />
            </Route>

            {/* Routes for all authenticated users */}
            <Route element={<PrivateRoutes  />}>
                <Route path="/organization-structure" element={<OrganizationStructurePage />} />
            </Route>

            {/* Routes only for Admin */}
            <Route element={<PrivateRoutes allowedRoles={[UserRole.ADMIN]} />}>
                <Route path="/user-management" element={<UserManagementPage />} />
            </Route>

            {/* Routes only for Anggota & Pimpinan */}
            <Route element={<PrivateRoutes allowedRoles={[UserRole.ANGGOTA, UserRole.PIMPINAN]} />}>
                <Route path="/my-data-personel" element={<MyDataPersonel />} />
            </Route>
            
            {/* Routes for Permohonan (Anggota, HR, Pimpinan) */}
            <Route element={<PrivateRoutes allowedRoles={[UserRole.ANGGOTA, UserRole.HR, UserRole.PIMPINAN]} />}>
                <Route path="/permohonan" element={<PermohonanPage />} />
            </Route>

            {/* Routes for Change Password*/}
            <Route element={<PrivateRoutes  />}>
                <Route path="/change-password" element={<ChangePassword />} />
            </Route>
            
            {/* Routes for Staffing Status (Admin, HR, Pimpinan) */}
            <Route element={<PrivateRoutes allowedRoles={[UserRole.ADMIN, UserRole.HR, UserRole.PIMPINAN]} />}>
                <Route path="/staffing-status" element={<StaffingStatusPage />} />
            </Route>

            {/* Routes for Information - accessible to all authenticated users */}
            <Route element={<PrivateRoutes />}>
                <Route path="/information" element={<InformationPage />} />
            </Route>
        </Routes>
    );
};

export default MainRoutes;