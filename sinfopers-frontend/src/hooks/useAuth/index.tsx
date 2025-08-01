// src/hooks/useAuth/index.tsx
import axiosClient from "@/networks/apiClient";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthStateInterface, LoginDataInterface, LoginResponseInterface, UserRole } from "./types";

const USER_ROLE_KEY = "user_role";
const USERNAME_KEY = "username";

const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginResponse, setLoginResponse] = useState<LoginResponseInterface>();


  // Inisialisasi state dengan pengecekan Cookies
  const [authState, setAuthState] = useState<AuthStateInterface>(() => {
    const token = Cookies.get("jwt_token");
    const role = Cookies.get(USER_ROLE_KEY);
    const username = Cookies.get(USERNAME_KEY);

    if (token) {
      return {
        isAuthenticated: true,
        role: role as UserRole,
        username: username || "",
      };
    }
    return { isAuthenticated: false };
  });

  // Debug auth state
  useEffect(() => {
    console.log("Current Auth State:", authState);
  }, [authState]);

  const loginAccount = useCallback(
      async ({ username, password }: LoginDataInterface) => {
        try {
          setLoading(true);

          const loginData = {
            username: username,
            password: password,
          };

          // Menambahkan logging untuk membantu debug
          console.log("Mencoba login ke:", axiosClient.defaults.baseURL + "/auth/login/");
          
          // Coba login dengan URL yang benar
          const responseLogin = await axiosClient.post("/auth/login/", loginData);
          console.log("Login Response:", responseLogin.data);

          if (responseLogin.data.success) {
            const token = responseLogin.data.data.token;
            const userRole = responseLogin.data.data.role;
            const userName = responseLogin.data.data.username;

            // Simpan token dan informasi user di cookies
            Cookies.set("jwt_token", token);
            Cookies.set(USER_ROLE_KEY, userRole);
            Cookies.set(USERNAME_KEY, userName);

            // Untuk debugging: dekode token untuk melihat isinya
            const data_user = jwtDecode(token) as { [key: string]: any };
            console.log("[User Data]", data_user);

            setAuthState({
              isAuthenticated: true,
              role: userRole as UserRole,
              username: userName
            });
          }

          setLoginResponse(responseLogin.data);
        } catch (err) {
          console.error("Login error:", err);
          setLoginResponse({
            success: false,
            message: "Failed Login",
            data: undefined,
          });
        } finally {
          setLoading(false);
        }
      },
      []
  );

  const logoutAccount = useCallback(() => {
    // Hapus semua cookies
    Cookies.remove("jwt_token");
    Cookies.remove(USER_ROLE_KEY);
    Cookies.remove(USERNAME_KEY);

    setAuthState({ isAuthenticated: false });
    navigate("/auth");
  }, [navigate]);

  // Method untuk cek apakah user memiliki role tertentu
  const hasRole = useCallback((roles: UserRole | UserRole[]) => {
    if (!authState.isAuthenticated || !authState.role) {
      return false;
    }

    // Jika admin selalu punya akses
    if (authState.role === UserRole.ADMIN) {
      return true;
    }

    // Cek apakah user memiliki salah satu dari role yang diizinkan
    if (Array.isArray(roles)) {
      return roles.includes(authState.role);
    }

    // Cek role tunggal
    return roles === authState.role;
  }, [authState]);

  return {
    isAuthenticated: authState.isAuthenticated,
    role: authState.role,
    username: authState.username,
    loading,
    hasRole,
    loginAccount,
    logoutAccount,
    loginResponse,
  };
};

export default useAuth;