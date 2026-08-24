'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, userData: any) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  const checkAuth = async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      if (!isPublicRoute) {
        router.replace('/login');
      }
      return;
    }

    try {
      const res = await api.get('/auth/me');
      const userData = res.data?.data;
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (pathname === '/login') {
          router.replace('/dashboard');
        }
      } else {
        throw new Error('User data null');
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      if (!isPublicRoute) {
        router.replace('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const login = (accessToken: string, refreshToken: string, userData: any) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoading(false);
    router.replace('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout api errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      queryClient.clear();
      setUser(null);
      setIsLoading(false);
      router.replace('/login');
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {isLoading ? (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-md">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <span className="text-base font-bold text-slate-200">جاري التحقق من تسجيل الدخول...</span>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
