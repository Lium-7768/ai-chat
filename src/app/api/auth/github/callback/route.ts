import { NextRequest, NextResponse } from 'next/server';
import { githubConfig } from '@/lib/github-oauth';
import { signToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

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

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: githubConfig.clientId,
        client_secret: githubConfig.clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.access_token === undefined) {
      console.error('Failed to get access token');
      const url = new URL('/', request.url);
      url.searchParams.set('error', 'failed_to_get_token');
      return NextResponse.redirect(url);
    }

    const accessToken = tokenData.access_token;

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'GitHub-OAuth-App',
      },
    });

    const userData = await userResponse.json();

    if (userData.email === null || userData.email === undefined || userData.email === '') {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'GitHub-OAuth-App',
        },
      });
      const emails = await emailsResponse.json();
      const primaryEmail = emails.find((e: { primary: boolean; email: string }) => e.primary);
      userData.email = primaryEmail?.email;
    }

    console.warn('GitHub user:', userData.login, userData.email);

    const user = {
      id: `github_${userData.id}`,
      email: userData.email ?? `${userData.login}@github.local`,
      name: userData.name ?? userData.login,
      provider: 'github' as const,
      githubAccessToken: accessToken,
    };

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
      githubAccessToken: user.githubAccessToken,
    });

    console.warn('Generated token, redirecting to dashboard...');

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
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    const url = new URL('/', request.url);
    url.searchParams.set('error', 'github_oauth_error');
    return NextResponse.redirect(url);
  }
}
