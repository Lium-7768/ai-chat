'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  provider?: 'github' | 'email';
  githubAccessToken?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchUser = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch {
      // 忽略错误
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchUser();
  }, []);

  // 处理 GitHub 登录后的刷新
  useEffect(() => {
    if (searchParams.get('refresh') === '1') {
      // 强制刷新用户信息
      void fetchUser();
      // 清除 URL 参数
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error ?? '登录失败' };
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const refreshUser = async (): Promise<void> => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
