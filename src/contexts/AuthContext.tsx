// =====================================================
// src/contexts/AuthContext.tsx
// Utilise le backend NestJS via api.ts
// =====================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi, usersApi, type AuthUser } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
  }) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurer la session au démarrage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi
        .getProfile()
        .then((profile) => setUser(profile))
        .catch(() => {
          // Token expiré ou invalide
          localStorage.removeItem('access_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('access_token', response.access_token);
      setUser(response.user);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      return false;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string,
  ): Promise<boolean> => {
    setError(null);
    try {
      const response = await authApi.register({
        firstName,
        lastName,
        email,
        password,
        phone,
      });
      localStorage.setItem('access_token', response.access_token);
      setUser(response.user);
      return true;
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
      return false;
    }
  };

  const updateProfile = async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
  }): Promise<boolean> => {
    if (!user) return false;
    setError(null);
    try {
      const updated = await usersApi.update(user.id, data);
      setUser((prev) => (prev ? { ...prev, ...updated } : prev));
      return true;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: user !== null,
        isAdmin: user?.role === 'ADMIN',
        error,
        loading,
      }}
    >
      {!loading ? children : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Chargement...</div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
