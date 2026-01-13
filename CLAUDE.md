# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Development Commands

**Always use `bun` as the package manager** (the project uses `bun.lockb`, not
`package-lock.json`):

```bash
# Development
bun run dev          # Start dev server on http://localhost:3000

# Build & Type Check
bun run build        # Production build (requires Node.js 20+)
bun run typecheck    # TypeScript type checking

# Linting & Formatting
bun run lint         # Run ESLint
bun run lint:fix     # Auto-fix ESLint issues
bun run format       # Format with Prettier
```

**Pre-commit hooks** automatically run `bun run lint:fix && bun run format`. If
hooks fail, commit with `--no-verify` at your own risk.

## Architecture Overview

### Tech Stack

- **Next.js 16** with App Router (Turbopack enabled by default)
- **React 19** with Server Components
- **TypeScript** with strict mode enabled (including
  `exactOptionalPropertyTypes`)
- **shadcn/ui** components built on Radix UI
- **Tailwind CSS v4**
- **Authentication**: Custom JWT implementation using `jose` library

### Authentication Flow

The app uses a custom JWT-based auth system (not NextAuth.js):

1. **GitHub OAuth** (`src/lib/github-oauth.ts`):
   - `GET /api/auth/github` → redirects to GitHub
   - `GET /api/auth/github/callback` → exchanges code for access token, creates
     JWT

2. **Email Login** (`src/app/api/auth/login/route.ts`):
   - Test users hardcoded in-memory (production needs real backend)

3. **JWT Management** (`src/lib/auth.ts`):
   - `signToken()` - creates JWT with 7-day expiration
   - `verifyToken()` - validates JWT on server
   - `getUserFromCookies()` - client-side JWT parsing (no verification)

4. **Client Auth State** (`src/components/providers/auth-provider.tsx`):
   - `AuthProvider` wraps the app, fetches current user from `/api/auth/me`
   - `useAuth()` hook provides `user`, `isLoading`, `login`, `logout`

### Key Architectural Patterns

**Suspense Boundaries**: Pages using `useSearchParams()` must be wrapped in
`<Suspense>`. See `src/app/page.tsx` - it imports `LoginPage` from
`src/app/login-page.tsx` to avoid static generation issues.

**Type Safety with `exactOptionalPropertyTypes`**: This compiler option is
enabled. When working with optional properties:

```typescript
// ❌ Wrong - `name: string | undefined` is not assignable to `name?: string`
return { name: payload.name as string | undefined };

// ✅ Correct - conditionally add the property
const result: UserPayload = { userId: '...', email: '...' };
if (payload.name !== undefined) {
  result.name = payload.name as string;
}
return result;
```

**Path Aliases** (configured in `tsconfig.json`):

- `@/components/*` → `src/components/*`
- `@/lib/*` → `src/lib/*`
- `@/app/*` → `src/app/*`
- `@/hooks/*` → `src/hooks/*`
- `@/types/*` → `src/types/*`
- `@/config/*` → `src/config/*`

### Project Structure Notes

- **`src/app/`** - Next.js App Router pages and API routes
- **`src/components/ui/`** - shadcn/ui components (manually installed, not CLI)
- **`src/lib/auth.ts`** - JWT token signing/verification
- **`src/lib/github-oauth.ts`** - GitHub OAuth flow helpers
- **`src/components/providers/`** - React context providers (Auth, Theme, i18n)

### CI/CD

GitHub Actions workflows (`.github/workflows/`):

- **ci.yml** - Runs lint, typecheck, and build on push/PR
- **code-review.yml** - Automated code review for PRs using custom skill

Both workflows use **bun** (not npm), with bun-aware caching.

### Environment Variables

Copy `.env.example` to `.env.local` for local development. Key variables:

- `JWT_SECRET` - Required for JWT signing
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - For GitHub OAuth
- `NEXT_PUBLIC_APP_URL` - Base URL (default: http://localhost:3000)

### Known Issues

- **Husky v10 deprecation**: The `.husky/pre-commit` file shows a deprecation
  warning. This is cosmetic and doesn't affect functionality.
- **Test users**: Email login uses hardcoded test users
  (`admin@example.com/admin123`, `user@example.com/user123`) - not
  production-ready.
