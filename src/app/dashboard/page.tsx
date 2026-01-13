'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarLabel,
} from '@/components/ui/sidebar';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getUserRepositories,
  createRepository,
  deleteRepository,
} from '@/lib/github';
import { GitHubRepository } from '@/types';

type Tab = 'overview' | 'github' | 'settings';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ repo: GitHubRepository } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const loadRepositories = useCallback(async () => {
    setIsLoadingRepos(true);
    setError(null);
    try {
      const repos = await getUserRepositories({ type: 'owner', sort: 'updated', per_page: 100 }, user?.githubAccessToken);
      setRepositories(repos);
    } catch {
      setError('加载仓库失败，请检查GitHub授权');
    } finally {
      setIsLoadingRepos(false);
    }
  }, [user?.githubAccessToken]);

  useEffect(() => {
    if (user?.githubAccessToken !== null && user?.githubAccessToken !== undefined && user?.githubAccessToken !== '') {
      void loadRepositories();
    }
  }, [user?.githubAccessToken, loadRepositories]);

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingRepo(true);
    setError(null);
    try {
      await createRepository({
        name: newRepoName,
        description: newRepoDescription,
        private: isPrivate,
        auto_init: true,
      }, user?.githubAccessToken);
      setNewRepoName('');
      setNewRepoDescription('');
      setIsPrivate(false);
      await loadRepositories();
    } catch {
      setError('创建仓库失败');
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const handleDeleteRepository = async () => {
    if (!deleteConfirmation) {
      return;
    }
    
    try {
      await deleteRepository(deleteConfirmation.repo.owner.login, deleteConfirmation.repo.name, user?.githubAccessToken);
      setDeleteConfirmation(null);
      await loadRepositories();
    } catch {
      setError('删除仓库失败');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar>
        <SidebarHeader>
          <h1 className="text-xl font-bold">AAXIS AI</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarLabel>控制面板</SidebarLabel>
          <div className="mt-2 space-y-1">
            <SidebarItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
              概览
            </SidebarItem>
            {user.provider === 'github' && (
              <SidebarItem active={activeTab === 'github'} onClick={() => setActiveTab('github')}>
                GitHub 仓库
              </SidebarItem>
            )}
            <SidebarItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
              设置
            </SidebarItem>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              登录方式: {user.provider === 'github' ? 'GitHub' : '邮箱'}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
              登出
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>欢迎回来，{user.name}!</CardTitle>
                <CardDescription>这是您的控制面板概览</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {user.provider === 'github' && (
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('github')}>
                      管理GitHub仓库
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('settings')}>
                      打开设置
                    </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>账户信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">登录方式</span>
                      <span>{user.provider === 'github' ? 'GitHub OAuth' : '邮箱密码'}</span>
                    </div>
                    {user.provider === 'github' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GitHub授权</span>
                        <span className="text-green-600">已授权</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'github' && user.provider === 'github' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>GitHub仓库管理</CardTitle>
                <CardDescription>管理您的GitHub仓库</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">创建新仓库</h3>
                  <form onSubmit={handleCreateRepository} className="space-y-4">
                    <div>
                      <Label htmlFor="repo-name">仓库名称</Label>
                      <Input
                        id="repo-name"
                        placeholder="my-awesome-repo"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        required
                        className="max-w-md mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="repo-description">描述（可选）</Label>
                      <Input
                        id="repo-description"
                        placeholder="仓库描述"
                        value={newRepoDescription}
                        onChange={(e) => setNewRepoDescription(e.target.value)}
                        className="max-w-md mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="repo-private"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="repo-private" className="cursor-pointer">
                        私有仓库
                      </Label>
                    </div>
                    <Button type="submit" disabled={isCreatingRepo || !newRepoName.trim()}>
                      {isCreatingRepo ? '创建中...' : '创建仓库'}
                    </Button>
                  </form>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">我的仓库 ({repositories.length})</h3>
                  {isLoadingRepos ? (
                    <p className="text-sm text-muted-foreground">加载中...</p>
                  ) : repositories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">暂无仓库</p>
                  ) : (
                    <div className="grid gap-4">
                      {repositories.map((repo) => (
                        <div
                          key={repo.id}
                          className="flex items-start justify-between p-4 border rounded-lg bg-white dark:bg-zinc-900"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {repo.full_name}
                              </a>
                              {repo.private && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                  Private
                                </span>
                              )}
                            </div>
                            {repo.description !== null && repo.description !== undefined && repo.description !== '' && (
                              <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{repo.language !== null && repo.language !== undefined ? repo.language : '未知语言'}</span>
                              <span>⭐ {repo.stargazers_count}</span>
                              <span>🍴 {repo.forks_count}</span>
                              <span>🔍 {repo.watchers_count}</span>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteConfirmation({ repo })}
                          >
                            删除
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error !== null && error !== undefined && error !== '' && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>设置</CardTitle>
                <CardDescription>管理您的账户设置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <h3 className="font-semibold mb-2">账户信息</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">用户ID</span>
                        <span>{user.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">邮箱</span>
                        <span>{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">用户名</span>
                        <span>{user.name}</span>
                      </div>
                    </div>
                  </div>

                  {user.provider === 'github' && (
                    <div className="pb-4 border-b">
                      <h3 className="font-semibold mb-2">GitHub集成</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        您已通过GitHub登录，可以管理GitHub仓库
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>已授权</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>确认删除仓库</CardTitle>
              <CardDescription>
                您确定要删除仓库 <strong>{deleteConfirmation.repo.full_name}</strong> 吗？
                此操作无法撤销。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                  取消
                </Button>
                <Button variant="destructive" onClick={handleDeleteRepository}>
                  确认删除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
