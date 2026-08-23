'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient, authApi } from '@quickbite/api-client';

export interface AuthState {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

let _token: string | null = null;

const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/admin',
  CUSTOMER: '/customer',
  RESTAURANT_OWNER: '/restaurant',
  DELIVERY_PARTNER: '/delivery',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem('qb_token');
      const u = localStorage.getItem('qb_user');
      if (t && u) {
        _token = t;
        setUser(JSON.parse(u));
      }
    } catch {}
    configureApiClient({
      baseUrl: 'http://localhost:3000/api',
      getToken: async () => _token || localStorage.getItem('qb_token'),
    });
    setLoading(false);
  }, []);

  const login = async (e: string, p: string) => {
    const res = await authApi.login({ email: e, password: p });
    const d = res.data as any;
    const token = d.tokens?.accessToken || d.accessToken;
    const usr = d.user;
    _token = token;
    setUser(usr);
    try {
      localStorage.setItem('qb_token', token);
      localStorage.setItem('qb_user', JSON.stringify(usr));
    } catch {}
    const route = ROLE_ROUTES[usr.role] || '/customer';
    router.push(route);
  };

  const logout = () => {
    _token = null;
    setUser(null);
    try {
      localStorage.removeItem('qb_token');
      localStorage.removeItem('qb_user');
    } catch {}
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token: _token, login, logout }}>
      {loading ? (
        <div className="loading" style={{ minHeight: '100vh' }}>
          <div className="spinner" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
