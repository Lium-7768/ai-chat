import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

// 模拟用户数据库
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123', // 实际项目中应该使用哈希加密
    name: 'Admin User',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: 'Test User',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 验证输入
    if (email === '' || password === '') {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 });
    }

    // 查找用户
    const user = users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    // 验证密码
    if (user.password !== password) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    // 生成JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
    });

    // 设置cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
}
