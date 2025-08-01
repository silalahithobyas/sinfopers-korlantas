export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  PIMPINAN = 'pimpinan',
  ANGGOTA = 'anggota'
}

export interface LoginDataInterface {
  username: string;
  password: string;
}

export interface AuthStateInterface {
  isAuthenticated: boolean;
  role?: UserRole;
  username?: string;
}

export interface LoginResponseInterface {
  success: boolean;
  message: string;
  data?: {
    token: string;
    refresh_token: string;
    username: string;
    role: UserRole;
    is_staff: boolean;
  };
}
