'use client';

import { useEffect, useState } from 'react';
import { Github } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/auth-provider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 检查 URL 中的错误参数
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        github_auth_cancelled: '您取消了 GitHub 授权',
        missing_code: '授权失败，缺少授权码',
        failed_to_get_user: '获取用户信息失败，请重试',
      };
      const message = errorMessages[errorParam] ?? '登录失败，请重试';
      // 使用 setTimeout 避免在 effect 中直接调用 setState
      setTimeout(() => setError(message), 0);
      // 清除 URL 中的错误参数
      router.replace('/');
    }
  }, [searchParams, router]);

  // 如果已登录，重定向到dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || '登录失败');
    }

    setIsLoading(false);
  };

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>选择一种方式登录账户</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGitHubLogin}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              使用 GitHub 登录
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-50 px-2 text-muted-foreground dark:bg-black">
                  或使用邮箱登录
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">测试账号：</p>
              <p>admin@example.com / admin123</p>
              <p>user@example.com / user123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
