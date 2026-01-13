'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/auth-provider';
import { useRepository, useUpdateRepository, useDeleteRepository } from '@/hooks';
import { toast } from 'sonner';

export default function EditRepositoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const owner = params.owner as string;
  const repoName = params.repo as string;

  // React Query hooks
  const {
    data: repository,
    isLoading,
    error: queryError,
  } = useRepository(owner, repoName, user?.githubAccessToken);
  const updateMutation = useUpdateRepository();
  const deleteMutation = useDeleteRepository();

  // Form state - derived from repository data
  const initialFormState = useMemo(() => {
    if (repository !== null && repository !== undefined) {
      return {
        name: repository.name,
        description:
          repository.description !== null && repository.description !== undefined
            ? repository.description
            : '',
        isPrivate: repository.private,
      };
    }
    return {
      name: '',
      description: '',
      isPrivate: false,
    };
  }, [repository]);

  const [name, setName] = useState(initialFormState.name);
  const [description, setDescription] = useState(initialFormState.description);
  const [isPrivate, setIsPrivate] = useState(initialFormState.isPrivate);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync form when repository data changes (using key pattern)
  useEffect(() => {
    setName(initialFormState.name);
    setDescription(initialFormState.description);
    setIsPrivate(initialFormState.isPrivate);
  }, [initialFormState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateMutation.mutate(
      {
        owner,
        repo: repoName,
        params: {
          name,
          description,
          private: isPrivate,
        },
        token: user?.githubAccessToken ?? null,
      },
      {
        onSuccess: (updated) => {
          toast.success('仓库更新成功');
          // If repository name changed, update URL
          if (name !== repoName) {
            router.push(`/dashboard/github/${updated.owner.login}/${updated.name}/edit`);
          }
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      {
        owner,
        repo: repoName,
        token: user?.githubAccessToken ?? null,
      },
      {
        onSuccess: () => {
          toast.success('仓库删除成功');
          setShowDeleteConfirm(false);
          router.push('/dashboard?tab=github');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (repository === null || queryError !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {queryError instanceof Error ? queryError.message : '仓库不存在'}
            </p>
            <Button onClick={() => router.push('/dashboard?tab=github')}>返回</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard?tab=github')}>
            ← 返回
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>编辑仓库</CardTitle>
            <CardDescription>修改仓库的设置</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">
                  仓库名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="my-awesome-repo"
                />
                <p className="text-xs text-muted-foreground mt-1">注意：修改仓库名称会更新 URL</p>
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 min-h-[80px] resize-y"
                  placeholder="描述这个仓库的用途"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="private" className="cursor-pointer">
                  设为私有仓库
                </Label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    删除仓库
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard?tab=github')}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? '保存中...' : '保存更改'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 仓库信息卡片 */}
        {repository && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>仓库信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">完整名称</span>
                  <span className="font-medium">{repository.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">所有者</span>
                  <span className="font-medium">{repository.owner.login}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">创建时间</span>
                  <span className="font-medium">
                    {new Date(repository.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">更新时间</span>
                  <span className="font-medium">
                    {new Date(repository.updated_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">语言</span>
                  <span className="font-medium">
                    {repository.language !== null && repository.language !== undefined
                      ? repository.language
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stars</span>
                  <span className="font-medium">⭐ {repository.stargazers_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forks</span>
                  <span className="font-medium">🍴 {repository.forks_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Watchers</span>
                  <span className="font-medium">👁️ {repository.watchers_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open Issues</span>
                  <span className="font-medium">📋 {repository.open_issues_count}</span>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href={repository.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  在 GitHub 上查看 →
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && repository && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">确认删除仓库</h3>
              <p className="text-sm text-muted-foreground mb-4">
                你确定要删除仓库 <strong>{repository.full_name}</strong> 吗？
                <br />
                <span className="text-red-600">此操作无法撤销，仓库中的所有数据将被永久删除。</span>
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteMutation.isPending}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '删除中...' : '确认删除'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
