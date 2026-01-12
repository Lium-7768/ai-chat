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

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: '无效的token' }, { status: 401 });
    }

    // GitHub 用户信息已在 token 中，直接返回
    if (payload.userId.startsWith('github_')) {
      return NextResponse.json({
        user: {
          id: payload.userId,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
        },
      });
    }

    // 测试用户从内存中查找
    const user = testUsers.find((u) => u.id === payload.userId);

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch {
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}
