import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAdminToken } from '../services/api.ts';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async (): Promise<boolean> => {
    const token = getAdminToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
    const valid = await api.verifyAdmin();
    setIsAuthenticated(valid);
    setIsLoading(false);
    return valid;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (password: string) => {
    const res = await api.loginAdmin(password);
    if (res.success) {
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    await api.logoutAdmin();
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
