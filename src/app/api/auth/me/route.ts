import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// 测试用户数据库
const testUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: 'Test User',
  },
];

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (token === undefined) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (payload === null) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 });
    }

    if (payload.userId.startsWith('github_')) {
      const userName = payload.name ?? payload.email.split('@')[0];
      return NextResponse.json({
        user: {
          id: payload.userId,
          email: payload.email,
          name: userName,
          provider: 'github',
          githubAccessToken: payload.githubAccessToken,
        },
      });
    }

    const user = testUsers.find((u) => u.id === payload.userId);

    if (user === undefined) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: 'email',
      },
    });
  } catch {
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}
