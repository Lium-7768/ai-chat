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
    onSuccess: (newRepo) => {
      void toast.success('仓库创建成功');
      // Add new repository to the list
      void queryClient.setQueryData<GitHubRepository[]>(repositoryKeys.list(), (old = []) => [
        newRepo,
        ...old,
      ]);
    },
    onError: (error: Error) => {
      void toast.error(`创建失败: ${error.message}`);
    },
    onSettled: () => {
      // Refetch to ensure server state
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
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
    onSuccess: (updatedRepo, variables) => {
      void toast.success('仓库更新成功');
      // Update repository in the list
      void queryClient.setQueryData<GitHubRepository[]>(repositoryKeys.list(), (old = []) =>
        old.map((r) =>
          r.owner.login === variables.owner && r.name === variables.repo ? updatedRepo : r
        )
      );
      // Update detail query
      void queryClient.setQueryData(
        repositoryKeys.detail(variables.owner, variables.repo),
        updatedRepo
      );
    },
    onError: (error: Error) => {
      void toast.error(`更新失败: ${error.message}`);
    },
    onSettled: (_data, _error, variables) => {
      // Refetch to ensure server state
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: repositoryKeys.detail(variables.owner, variables.repo),
      });
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
    onMutate: async ({ owner, repo }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: repositoryKeys.all });

      // Snapshot previous value
      const previousRepos = queryClient.getQueryData<GitHubRepository[]>(repositoryKeys.list());

      // Optimistically update to the new value
      void queryClient.setQueryData<GitHubRepository[]>(repositoryKeys.list(), (old = []) =>
        old.filter((r) => !(r.owner.login === owner && r.name === repo))
      );

      // Return context with previous value
      return { previousRepos };
    },
    onSuccess: () => {
      void toast.success('仓库删除成功');
    },
    onError: (error: Error, _variables, context) => {
      // If error is 404, the repository is already deleted - treat as success
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        void toast.success('仓库删除成功');
        return;
      }
      // Rollback to previous value
      if (context?.previousRepos !== undefined) {
        void queryClient.setQueryData(repositoryKeys.list(), context.previousRepos);
      }
      void toast.error(`删除失败: ${error.message}`);
    },
    onSettled: () => {
      // Refetch to ensure server state
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
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
    onMutate: async ({ repos }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: repositoryKeys.all });

      // Snapshot previous value
      const previousRepos = queryClient.getQueryData<GitHubRepository[]>(repositoryKeys.list());

      // Create a set of repos to delete for quick lookup
      const reposToDelete = new Set(repos.map((r) => `${r.owner.login}/${r.name}`));

      // Optimistically update to the new value
      void queryClient.setQueryData<GitHubRepository[]>(repositoryKeys.list(), (old = []) =>
        old.filter((r) => !reposToDelete.has(`${r.owner.login}/${r.name}`))
      );

      // Return context with previous value
      return { previousRepos };
    },
    onSuccess: (_, { repos }) => {
      void toast.success(`成功删除 ${repos.length} 个仓库`);
    },
    onError: (error: Error, _variables, context) => {
      // If error is 404, the repository is already deleted - treat as success
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        void toast.success('仓库删除成功');
        return;
      }
      // Rollback to previous value
      if (context?.previousRepos !== undefined) {
        void queryClient.setQueryData(repositoryKeys.list(), context.previousRepos);
      }
      void toast.error(`批量删除失败: ${error.message}`);
    },
    onSettled: () => {
      // Refetch to ensure server state
      void queryClient.invalidateQueries({ queryKey: repositoryKeys.all });
    },
    retry: false,
  });
}
