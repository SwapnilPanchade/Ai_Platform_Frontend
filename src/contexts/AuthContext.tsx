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

interface AuthState {
  token: string | null;
  // Add admin user details later if needed
  // user: { id: string; email: string; role: 'admin' } | null;
  isLoading: boolean; // To track initial auth state loading
  login: (token: string) => void;
  logout: () => void;
}

// Use a specific key for storage
const AUTH_TOKEN_KEY = "admin_jwt_token";

// Create the context with a default value
const AuthContext = createContext<AuthState | undefined>(undefined);

// Create the Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading

  // Load token from storage on initial mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        // TODO: Optionally verify token expiry here before setting
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error); // Handle potential SSR or privacy mode issues
    } finally {
      setIsLoading(false); // Finished loading initial state
    }
  }, []);

  const login = useCallback((newToken: string) => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      setToken(newToken);
      // TODO: Fetch admin user details after login if needed
    } catch (error) {
      console.error("Failed to save token to localStorage:", error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      // TODO: Clear user details
    } catch (error) {
      console.error("Failed to remove token from localStorage:", error);
    }
  }, []);

  const value = { token, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook for easy consumption
export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
