'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sidebar, SidebarContent, SidebarItem, SidebarLabel } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useAuth } from '@/components/providers/auth-provider';
import { useI18n } from '@/components/providers/i18n-provider';
import { getUserRepositories, createRepository, deleteRepository } from '@/lib/github';
import { GitHubRepository } from '@/types';
import { RepositoriesTable } from '@/components/github/repositories-table';

type Tab = 'overview' | 'github' | 'settings';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const loadRepositories = useCallback(async () => {
    setIsLoadingRepos(true);
    setError(null);
    try {
      const repos = await getUserRepositories(
        { type: 'owner', sort: 'updated', per_page: 100 },
        user?.githubAccessToken
      );
      setRepositories(repos);
    } catch {
      setError(t('github.loadFailed'));
    } finally {
      setIsLoadingRepos(false);
    }
  }, [user?.githubAccessToken, t]);

  useEffect(() => {
    if (
      user?.githubAccessToken !== null &&
      user?.githubAccessToken !== undefined &&
      user?.githubAccessToken !== ''
    ) {
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
      await createRepository(
        {
          name: newRepoName,
          description: newRepoDescription,
          private: isPrivate,
          auto_init: true,
        },
        user?.githubAccessToken
      );
      setNewRepoName('');
      setNewRepoDescription('');
      setIsPrivate(false);
      await loadRepositories();
    } catch {
      setError(t('github.createFailed'));
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const handleEditRepository = (repo: GitHubRepository) => {
    router.push(`/dashboard/github/${repo.owner.login}/${repo.name}/edit`);
  };

  const handleDeleteRepository = async (repo: GitHubRepository) => {
    try {
      await deleteRepository(repo.owner.login, repo.name, user?.githubAccessToken);
      await loadRepositories();
    } catch {
      setError(t('github.deleteFailed'));
    }
  };

  const handleBatchDeleteRepositories = async (repos: GitHubRepository[]) => {
    try {
      // 并发删除所有选中的仓库
      await Promise.all(
        repos.map((repo) => deleteRepository(repo.owner.login, repo.name, user?.githubAccessToken))
      );
      await loadRepositories();
    } catch {
      setError(`批量删除失败：已删除 ${repos.length} 个仓库中的部分仓库`);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b bg-white dark:bg-zinc-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">AAXIS AI</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* 用户信息 */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                ({user.provider === 'github' ? 'GitHub' : t('common.email')})
              </span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar>
          <SidebarContent>
            <SidebarLabel>{t('dashboard.title')}</SidebarLabel>
            <div className="mt-2 space-y-1">
              <SidebarItem
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              >
                {t('dashboard.tabs.overview')}
              </SidebarItem>
              {user.provider === 'github' && (
                <SidebarItem active={activeTab === 'github'} onClick={() => setActiveTab('github')}>
                  {t('dashboard.tabs.github')}
                </SidebarItem>
              )}
              <SidebarItem
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              >
                {t('dashboard.tabs.settings')}
              </SidebarItem>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.welcome', { name: user.name })}</CardTitle>
                  <CardDescription>{t('dashboard.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('dashboard.userId')}
                      </p>
                      <p className="text-lg">{user.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('dashboard.email')}
                      </p>
                      <p className="text-lg">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t('dashboard.username')}
                      </p>
                      <p className="text-lg">{user.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.quickActions')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {user.provider === 'github' && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab('github')}
                      >
                        {t('dashboard.manageGithub')}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab('settings')}
                    >
                      {t('dashboard.openSettings')}
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.accountInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('dashboard.loginMethod')}</span>
                        <span>
                          {user.provider === 'github' ? 'GitHub OAuth' : t('common.email')}
                        </span>
                      </div>
                      {user.provider === 'github' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('dashboard.githubAuth')}</span>
                          <span className="text-green-600">{t('dashboard.githubAuthed')}</span>
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
                  <CardTitle>GitHub 仓库管理</CardTitle>
                  <CardDescription>创建和管理你的 GitHub 仓库</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">创建新仓库</h3>
                    <form onSubmit={handleCreateRepository} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="repo-name">
                            仓库名称 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="repo-name"
                            placeholder="my-awesome-repo"
                            value={newRepoName}
                            onChange={(e) => setNewRepoName(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="repo-description">描述</Label>
                          <Input
                            id="repo-description"
                            placeholder="Repository description"
                            value={newRepoDescription}
                            onChange={(e) => setNewRepoDescription(e.target.value)}
                            className="mt-1"
                          />
                        </div>
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
                          设为私有仓库
                        </Label>
                      </div>
                      <Button type="submit" disabled={isCreatingRepo || !newRepoName.trim()}>
                        {isCreatingRepo ? '创建中...' : '创建仓库'}
                      </Button>
                    </form>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">我的仓库 ({repositories.length})</h3>
                    {error !== null && (
                      <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md">
                        {error}
                      </div>
                    )}
                    <RepositoriesTable
                      repositories={repositories}
                      isLoading={isLoadingRepos}
                      onEdit={handleEditRepository}
                      onDelete={handleDeleteRepository}
                      onBatchDelete={handleBatchDeleteRepositories}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.title')}</CardTitle>
                  <CardDescription>{t('settings.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="pb-4 border-b">
                      <h3 className="font-semibold mb-2">{t('settings.accountInfo')}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('dashboard.userId')}</span>
                          <span>{user.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('dashboard.email')}</span>
                          <span>{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('dashboard.username')}</span>
                          <span>{user.name}</span>
                        </div>
                      </div>
                    </div>

                    {user.provider === 'github' && (
                      <div className="pb-4 border-b">
                        <h3 className="font-semibold mb-2">{t('settings.githubIntegration')}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('settings.githubAuthorized')}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>{t('dashboard.githubAuthed')}</span>
                        </div>
                      </div>
                    )}

                    <div className="pb-4 border-b">
                      <h3 className="font-semibold mb-2">{t('settings.theme')}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.documentElement.setAttribute('class', 'light')}
                        >
                          {t('settings.light')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.documentElement.setAttribute('class', 'dark')}
                        >
                          {t('settings.dark')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.documentElement.removeAttribute('class')}
                        >
                          {t('settings.system')}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">{t('settings.language')}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.dispatchEvent(new CustomEvent('setLanguage', { detail: 'zh' }))
                          }
                        >
                          {t('settings.chinese')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.dispatchEvent(new CustomEvent('setLanguage', { detail: 'en' }))
                          }
                        >
                          {t('settings.english')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
