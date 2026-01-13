import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  deleteRepository,
  getRepository,
  getUserRepositories,
  createRepository,
  updateRepository,
} from '@/lib/github';
import type { GitHubRepository, GitHubCreateRepositoryParams } from '@/types';

// Query keys
export const repositoryKeys = {
  all: ['repositories'] as const,
  lists: () => [...repositoryKeys.all, 'list'] as const,
  list: () => [...repositoryKeys.all, 'list'] as const,
  details: () => [...repositoryKeys.all, 'detail'] as const,
  detail: (owner: string, repo: string) => [...repositoryKeys.all, 'detail', owner, repo] as const,
};

/**
 * Hook for fetching user repositories
 */
export function useRepositories(token?: string | null, enabled = true) {
  return useQuery({
    queryKey: repositoryKeys.list(),
    queryFn: () => getUserRepositories({ type: 'owner', sort: 'updated', per_page: 100 }, token),
    enabled: enabled && token !== null && token !== undefined && token !== '',
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook for fetching a single repository
 */
export function useRepository(owner: string, repo: string, token?: string | null) {
  return useQuery({
    queryKey: repositoryKeys.detail(owner, repo),
    queryFn: () => getRepository(owner, repo, token),
    enabled:
      owner !== null &&
      owner !== undefined &&
      owner !== '' &&
      repo !== null &&
      repo !== undefined &&
      repo !== '' &&
      token !== null &&
      token !== undefined &&
      token !== '',
  });
}

/**
 * Hook for creating a repository
 */
export function useCreateRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      params,
      token,
    }: {
      params: GitHubCreateRepositoryParams;
      token?: string | null;
    }) => createRepository(params, token),
    onSuccess: () => {
      void toast.success('仓库创建成功');
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
    },
    onError: (error: Error) => {
      void toast.error(`创建失败: ${error.message}`);
    },
  });
}

/**
 * Hook for updating a repository
 */
export function useUpdateRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      params,
      token,
    }: {
      owner: string;
      repo: string;
      params: { name?: string; description?: string; private?: boolean };
      token?: string | null;
    }) => updateRepository(owner, repo, params, token),
    onSuccess: (_data, variables) => {
      void toast.success('仓库更新成功');
      // Invalidate both list and detail queries
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: repositoryKeys.detail(variables.owner, variables.repo),
      });
    },
    onError: (error: Error) => {
      void toast.error(`更新失败: ${error.message}`);
    },
  });
}

/**
 * Hook for deleting a repository
 */
export function useDeleteRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      token,
    }: {
      owner: string;
      repo: string;
      token?: string | null;
    }) => deleteRepository(owner, repo, token),
    onSuccess: () => {
      void toast.success('仓库删除成功');
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
    },
    onError: (error: Error) => {
      // If error is 404, the repository is already deleted - treat as success
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        void toast.success('仓库删除成功');
        void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
        return;
      }
      void toast.error(`删除失败: ${error.message}`);
    },
    retry: false,
  });
}

/**
 * Hook for batch deleting repositories
 */
export function useBatchDeleteRepositories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ repos, token }: { repos: GitHubRepository[]; token?: string | null }) => {
      await Promise.all(repos.map((repo) => deleteRepository(repo.owner.login, repo.name, token)));
    },
    onSuccess: (_, { repos }) => {
      void toast.success(`成功删除 ${repos.length} 个仓库`);
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
    },
    onError: (error: Error) => {
      // If error is 404, the repository is already deleted - treat as success
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        void toast.success('仓库删除成功');
        void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
        return;
      }
      void toast.error(`批量删除失败: ${error.message}`);
    },
    retry: false,
  });
}
