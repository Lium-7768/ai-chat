import { GitHubRepository, GitHubCreateRepositoryParams, GitHubError } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';

async function fetchGitHub<T>(
  endpoint: string,
  options?: RequestInit,
  token?: string | null | undefined
): Promise<T> {
  if (token === null || token === undefined || token === '') {
    throw new Error('GitHub token not found. Please authenticate with GitHub first.');
  }

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `GitHub API error: ${response.status}`;
    try {
      const error: GitHubError = await response.json();
      errorMessage = error.message || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  // DELETE 请求返回 204 No Content，没有 body
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getUserRepositories(
  params?: {
    type?: 'all' | 'owner' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  },
  token?: string | null | undefined
): Promise<GitHubRepository[]> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  const queryString = queryParams.toString();
  return fetchGitHub<GitHubRepository[]>(
    `/user/repos${queryString ? `?${queryString}` : ''}`,
    undefined,
    token
  );
}

export async function createRepository(
  params: GitHubCreateRepositoryParams,
  token?: string | null | undefined
): Promise<GitHubRepository> {
  return fetchGitHub<GitHubRepository>(
    '/user/repos',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        private: params.private ?? false,
        auto_init: params.auto_init ?? false,
        gitignore_template: params.gitignore_template,
        license_template: params.license_template,
      }),
    },
    token
  );
}

export async function deleteRepository(
  owner: string,
  repoName: string,
  token?: string | null | undefined
): Promise<void> {
  await fetchGitHub<void>(
    `/repos/${owner}/${repoName}`,
    {
      method: 'DELETE',
    },
    token
  );
}

export async function getRepository(
  owner: string,
  repoName: string,
  token?: string | null | undefined
): Promise<GitHubRepository> {
  return fetchGitHub<GitHubRepository>(`/repos/${owner}/${repoName}`, undefined, token);
}

export async function getRepositoryLanguages(
  owner: string,
  repoName: string,
  token?: string | null | undefined
): Promise<Record<string, number>> {
  return fetchGitHub<Record<string, number>>(
    `/repos/${owner}/${repoName}/languages`,
    undefined,
    token
  );
}

export async function updateRepository(
  owner: string,
  repoName: string,
  params: {
    name?: string;
    description?: string;
    private?: boolean;
  },
  token?: string | null | undefined
): Promise<GitHubRepository> {
  return fetchGitHub<GitHubRepository>(
    `/repos/${owner}/${repoName}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    },
    token
  );
}
