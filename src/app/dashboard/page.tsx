'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // 如果未登录，重定向到登录页
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b bg-white dark:bg-zinc-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.name} ({user.email})
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              登出
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>欢迎回来，{user.name}!</CardTitle>
            <CardDescription>这是受保护的Dashboard页面</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">用户ID</p>
                <p className="text-lg">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">邮箱</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">用户名</p>
                <p className="text-lg">{user.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
