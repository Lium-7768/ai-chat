import { NextRequest, NextResponse } from 'next/server';
import { getGitHubUser } from '@/lib/github-oauth';
import { signToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // 如果用户拒绝授权
  if (error !== null) {
    console.error('GitHub OAuth error:', error);
    const url = new URL('/', request.url);
    url.searchParams.set('error', 'github_auth_cancelled');
    return NextResponse.redirect(url);
  }

  if (code === null) {
    console.error('Missing code parameter');
    const url = new URL('/', request.url);
    url.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(url);
  }

  console.warn('Received GitHub code, exchanging for user info...');

  // 获取 GitHub 用户信息
  const githubUser = await getGitHubUser(code);

  if (githubUser === null) {
    console.error('Failed to get GitHub user');
    const url = new URL('/', request.url);
    url.searchParams.set('error', 'failed_to_get_user');
    return NextResponse.redirect(url);
  }

  console.warn('GitHub user:', githubUser.login, githubUser.email);

  // 创建或更新用户（这里简化处理，实际应该存储到数据库）
  const user = {
    id: `github_${githubUser.id}`,
    email: githubUser.email ?? `${githubUser.login}@github.local`,
    name: githubUser.name ?? githubUser.login,
  };

  // 生成 JWT token
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  console.warn('Generated token, redirecting to dashboard...');

  // 重定向到 dashboard 并设置 cookie
  const url = new URL('/dashboard', request.url);
  const response = NextResponse.redirect(url);

  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}
