
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { API_ROUTES } from "@/constants/ApiRoutes";

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isSuperAdmin: boolean;
  [key: string]: unknown;
}

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "awfi_admin_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setAdmin(null);
      return false;
    }

    try {
    const response = await fetch(API_ROUTES.ADMIN.CHECK, {
  method: "GET",
  headers:{
    "Content-Type":"application/json"
  },
  credentials: "include",

});

      if (!response.ok) {
        localStorage.removeItem(TOKEN_KEY);
        setAdmin(null);
        return false;
      }

      const data = await response.json();

      // Adjust this mapping to match your ADMIN.CHECK response.
      const adminData = data.adminData ?? data.admin ?? data.data?.admin;

      if (adminData) {
        setAdmin(adminData as Admin);
      } else if (data.success === true) {
        // If CHECK returns only success, use LOGIN's profile only
        // if you explicitly persist and validate it separately.
        setAdmin(null);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setAdmin(null);
        return false;
      }

      return data.success === true && Boolean(adminData);
    } catch (error) {
      console.error("Authentication check failed:", error);
      setAdmin(null);
      return false;
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(API_ROUTES.ADMIN.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.token || !data.adminData) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setAdmin(data.adminData as Admin);
  };

  const logout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
      await fetch(API_ROUTES.ADMIN.LOGOUT, {
        method: "POST",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setAdmin(null);
      router.replace("/login");
    }
  };

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        await checkAuth();
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void initializeAuth();

    return () => {
      active = false;
    };
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: Boolean(admin),
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
