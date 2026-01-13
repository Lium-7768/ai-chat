'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GitHubRepository } from '@/types';
import { useI18n } from '@/components/providers/i18n-provider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RepositoriesTableProps {
  repositories: GitHubRepository[];
  isLoading: boolean;
  onEdit: (repo: GitHubRepository) => void;
  onDelete: (repo: GitHubRepository) => void;
}

export function RepositoriesTable({
  repositories,
  isLoading,
  onEdit,
  onDelete,
}: RepositoriesTableProps) {
  const { t } = useI18n();
  const [deleteConfirmation, setDeleteConfirmation] = useState<GitHubRepository | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>{t('github.loading')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (repositories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{t('github.noRepos')}</p>
            <p className="text-sm text-muted-foreground">
              创建你的第一个仓库开始使用 GitHub 管理
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>仓库</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>语言</TableHead>
                <TableHead>⭐ Stars</TableHead>
                <TableHead>🍴 Forks</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.map((repo) => (
                <TableRow key={repo.id}>
                  <TableCell>
                    <div>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {repo.full_name}
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">
                        创建于 {new Date(repo.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-xs truncate">
                      {repo.description || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800">
                      {repo.language || '-'}
                    </span>
                  </TableCell>
                  <TableCell>{repo.stargazers_count}</TableCell>
                  <TableCell>{repo.forks_count}</TableCell>
                  <TableCell>
                    {repo.private ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        私有
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        公开
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(repo)}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">编辑</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmation(repo)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <span className="sr-only">删除</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">确认删除仓库</h3>
              <p className="text-sm text-muted-foreground mb-4">
                你确定要删除仓库 <strong>{deleteConfirmation.full_name}</strong> 吗？
                <br />
                <span className="text-red-600">此操作无法撤销，仓库中的所有数据将被永久删除。</span>
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete(deleteConfirmation);
                    setDeleteConfirmation(null);
                  }}
                >
                  确认删除
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
