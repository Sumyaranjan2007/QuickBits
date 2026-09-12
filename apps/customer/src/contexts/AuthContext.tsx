import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, configureApiClient } from '@quickbite/api-client';

// Simple in-memory token storage (swap with SecureStore in production builds)
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  profile: { firstName: string; lastName: string; avatarUrl: string | null } | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure API client to use our token
  useEffect(() => {
    const win = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    const apiBase = win && win.location?.hostname
      ? `http://${win.location.hostname}:3000/api/v1`
      : 'http://10.0.2.2:3000/api/v1';

    configureApiClient({
      baseUrl: apiBase,
      getToken: async () => _accessToken,
    });
    // Try to load profile on mount (if token exists)
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!_accessToken) {
        setIsLoading(false);
        return;
      }
      const res = await authApi.getProfile();
      setUser(res.data as User);
    } catch {
      _accessToken = null;
      _refreshToken = null;
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const data = res.data as { accessToken: string; refreshToken: string; user: User };
    _accessToken = data.accessToken;
    _refreshToken = data.refreshToken;
    setUser(data.user);
  }, []);

  const loginAsGuest = useCallback(() => {
    setUser({
      id: 'demo-user-1',
      email: 'guest@quickbits.com',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      profile: {
        firstName: 'Suren',
        lastName: 'Koramangala',
        avatarUrl: null,
      },
    });
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await authApi.register({ ...data, role: 'CUSTOMER' });
    const d = res.data as { accessToken: string; refreshToken: string; user: User };
    _accessToken = d.accessToken;
    _refreshToken = d.refreshToken;
    setUser(d.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    _accessToken = null;
    _refreshToken = null;
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginAsGuest,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
