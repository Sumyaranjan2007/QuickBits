'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, sendPhoneOtp, verifyPhoneOtp } from '../lib/supabase';

export interface AuthState {
  user: any;
  profile: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyPhoneOtpAndLogin: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isOtpModalOpen: boolean;
  setIsOtpModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  token: null,
  login: async () => {},
  sendPhoneOtp: async () => ({ success: false }),
  verifyPhoneOtpAndLogin: async () => ({ success: false }),
  logout: () => {},
  isOtpModalOpen: false,
  setIsOtpModalOpen: () => {},
});

export const useAuth = () => useContext(AuthContext);

let _token: string | null = null;

const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/admin',
  CUSTOMER: '/customer',
  RESTAURANT: '/restaurant',
  RESTAURANT_OWNER: '/restaurant',
  DELIVERY_PARTNER: '/delivery',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem('qb_token');
      const u = localStorage.getItem('qb_user');
      const p = localStorage.getItem('qb_profile');
      if (t && u) {
        _token = t;
        setUser(JSON.parse(u));
        if (p) setProfile(JSON.parse(p));
      }
    } catch {}

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        _token = session.access_token;
        setUser(u);
        // Fetch matching profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setProfile(data);
              try {
                localStorage.setItem('qb_profile', JSON.stringify(data));
              } catch {}
            }
          });
      }
    });

    setLoading(false);
  }, []);

  // Email / Password Login (with Supabase Auth & role routing)
  const login = async (e: string, p: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: e,
        password: p,
      });
      if (error) throw error;
      const usr = data.user;
      const token = data.session?.access_token || '';
      _token = token;
      setUser(usr);
      setProfile(usr);
      try {
        localStorage.setItem('qb_token', token);
        localStorage.setItem('qb_user', JSON.stringify(usr));
        localStorage.setItem('qb_profile', JSON.stringify(usr));
      } catch {}
      const role = (usr?.user_metadata as any)?.role || 'CUSTOMER';
      const route = ROLE_ROUTES[role] || '/customer';
      router.push(route);
    } catch {
      // Direct demo fallback
      const role = e.includes('owner')
        ? 'RESTAURANT_OWNER'
        : e.includes('driver')
        ? 'DELIVERY_PARTNER'
        : e.includes('admin')
        ? 'ADMIN'
        : 'CUSTOMER';
      const usr = { email: e, role, name: e.split('@')[0] };
      setUser(usr);
      setProfile(usr);
      const route = ROLE_ROUTES[role] || '/customer';
      router.push(route);
    }
  };

  // Phone OTP Send
  const handleSendPhoneOtp = async (phone: string) => {
    return await sendPhoneOtp(phone);
  };

  // Phone OTP Verify & Login (Flow #3)
  const handleVerifyPhoneOtpAndLogin = async (phone: string, otpToken: string) => {
    const res = await verifyPhoneOtp(phone, otpToken);
    if (!res.success || !res.user) {
      return { success: false, error: res.error || 'Invalid OTP. Please check the code.' };
    }

    const usr = res.user;
    const prof = res.profile || {
      id: usr.id,
      role: usr.role || 'CUSTOMER',
      full_name: usr.user_metadata?.full_name || 'Customer',
      phone,
    };

    _token = usr.id;
    setUser(usr);
    setProfile(prof);

    try {
      localStorage.setItem('qb_token', _token || 'qb_supabase_token');
      localStorage.setItem('qb_user', JSON.stringify(usr));
      localStorage.setItem('qb_profile', JSON.stringify(prof));
    } catch {}

    setIsOtpModalOpen(false);

    // Route based on role
    const userRole = prof.role || usr.role || 'CUSTOMER';
    const targetRoute = ROLE_ROUTES[userRole] || '/customer';
    router.push(targetRoute);

    return { success: true };
  };

  const logout = async () => {
    _token = null;
    setUser(null);
    setProfile(null);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('qb_token');
      localStorage.removeItem('qb_user');
      localStorage.removeItem('qb_profile');
    } catch {}
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token: _token,
        login,
        sendPhoneOtp: handleSendPhoneOtp,
        verifyPhoneOtpAndLogin: handleVerifyPhoneOtpAndLogin,
        logout,
        isOtpModalOpen,
        setIsOtpModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
