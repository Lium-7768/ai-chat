import { SignJWT, jwtVerify } from 'jose'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const key = new TextEncoder().encode(SECRET_KEY)

export interface UserPayload {
  userId: string
  email: string
  name?: string
}

export interface UserInfo {
  id: string
  email: string
  name: string
}

export async function signToken(payload: UserPayload & { name?: string }): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function verifyToken(token: string): Promise<(UserPayload & { name?: string }) | null> {
  try {
    const { payload } = await jwtVerify(token, key)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
    }
  } catch {
    return null
  }
}

export function getUserFromCookies(): UserPayload | null {
  if (typeof window === 'undefined') {return null}

  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('auth_token='))
    ?.split('=')[1]

  if (!token) {return null}

  // Parse JWT payload (without verification for client side)
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload) as UserPayload
  } catch {
    return null
  }
}

export function setAuthCookie(token: string): void {
  if (typeof window === 'undefined') {return}

  document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; same-site=lax`
}

export function clearAuthCookie(): void {
  if (typeof window === 'undefined') {return}

  document.cookie = 'auth_token=; path=/; max-age=0'
}
