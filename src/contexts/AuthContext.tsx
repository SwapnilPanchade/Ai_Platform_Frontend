// frontend/src/contexts/AuthContext.tsx
"use client"; // Context needs to be used by Client Components

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface AuthUser {
  id: string;
  role: "admin" | "pro" | "free";
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
}

const AUTH_TOKEN_KEY = "admin_jwt_token";

const AUTH_USER_KEY = "admin_user_data";

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      if (storedToken) {
        // TODO: Optionally verify token expiry here before setting
        setToken(storedToken);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, userData: AuthUser) => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      // TODO: Fetch admin user details after login if needed
    } catch (error) {
      console.error("Failed to save Auth state :", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setToken(null);
      setUser(null);
      // TODO: Clear user details
    } catch (error) {
      console.error("Failed to remove token from localStorage:", error);
    }
  }, []);

  const value = { token, user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
