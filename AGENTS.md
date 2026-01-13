# AGENTS.md

This file provides instructions and guidelines for AI coding agents operating in
this repository.

## Project Overview

**Project:** AI Chat **Tech Stack:**

- Next.js 16.1.1 (App Router, Server Components)
- React 19.2.3
- TypeScript 5 (strict mode)
- shadcn/ui (Radix UI + Tailwind CSS 4)
- Bun (package manager)

## Development Commands

### Setup and Installation

```bash
bun install
cp .env.example .env
```

### Development Server

```bash
bun run dev
```

### Build Commands

```bash
# Build for production
bun run build

# Start production server
bun run start
```

### Linting and Formatting

```bash
# Run ESLint
bun run lint

# Auto-fix ESLint issues
bun run lint:fix

# Format code with Prettier
bun run format

# Check formatting
bun run format:check
```

### Type Checking

```bash
# One-time type check
bun run typecheck

# Watch mode type checking
bun run typecheck:watch
```

### Code Quality Commands

```bash
# Run all pre-commit checks
bun run precommit

# Clean build artifacts
bun run clean
```

## Testing Commands

### Running Tests

```bash
# Run all tests
bun run test

# Run single test file
bun run test src/lib/utils.test.ts

# Run tests matching pattern
bun run test -- testNamePattern="utility"

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run a specific test file
bun test -- path=src/lib/utils.test.ts --testNamePattern="should"
```

### Coverage Commands

```bash
# Generate coverage report
bun run test:coverage

# Open coverage report in browser
bun run coverage:report

# Check coverage threshold
bun run coverage:check
```

## Code Style Guidelines

### Import Organization

**Use absolute imports from `@/` aliases:**

```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks';

// ❌ AVOID
import { Button } from '../../../components/ui/button';
import { formatDate } from '../../lib/utils';
```

**Import order:**

1. React imports (`'react'`, `'react-dom'`)
2. Third-party libraries (`next/navigation`, `lucide-react`)
3. Internal imports (`@/components/*`, `@/lib/*`, `@/hooks/*`)
4. Type imports (if types are in separate files)

```typescript
// ✅ CORRECT
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

// ❌ AVOID
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
('use client');
import { useEffect, useState } from 'react';
```

### Formatting and Spacing

**Use 2 spaces for indentation** **Maximum line length: 100 characters** **Use
trailing commas in multiline arrays/objects** **Use single quotes for strings
(Prettier default)**

```typescript
// ✅ CORRECT
const user = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

// ❌ AVOID
const user = { id: '123', name: 'John Doe', email: 'john@example.com' };
```

### Type Safety

**Always use strict TypeScript** **Avoid `any` type** **Use explicit return
types for public functions** **Prefer interfaces over type aliases for object
shapes**

```typescript
// ✅ CORRECT
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  const user = await fetchUser(id);
  return user;
};

// ❌ AVOID
const getUser = async (id: string) => {
  const user = await fetchUser(id);
  return user; // inferred type
};
```

**Type assertions should be avoided:**

```typescript
// ✅ CORRECT
const element = document.getElementById('app') as HTMLElement;

// ❌ AVOID
const element = <HTMLElement>document.getElementById('app');
```

### Naming Conventions

**Components:** PascalCase (`UserProfile.tsx`) **Hooks:** camelCase with `use`
prefix (`useLocalStorage.ts`) **Functions:** camelCase (`formatDate.ts`)
**Constants:** UPPER_SNAKE_CASE (`API_BASE_URL.ts`) **Types:** PascalCase
(`User.ts`, `ApiResponse.ts`) **Interfaces:** PascalCase (`IUserService.ts`)

```typescript
// ✅ CORRECT
interface UserSettings {
  userId: string;
  themePreference: 'light' | 'dark' | 'system';
}

const API_BASE_URL = 'https://api.example.com';

export function formatDate(date: Date): string {
  // implementation
}

// ❌ AVOID
interface userSettings {
  user_id: string;
  themePreference: 'light' | 'dark' | 'system';
}

const api_base_url = 'https://api.example.com';

export function format_date(date: Date): string {
  // implementation
}
```

### React Hooks Best Practices

**Always use `use client` directive for components using hooks** **Follow rules
of hooks** **Use dependency arrays correctly** **Cleanup effects properly**

```typescript
'use client';

import { useEffect, useState } from 'react';

// ✅ CORRECT - Proper dependency array
useEffect(() => {
  const fetchData = async () => {
    const data = await fetch(url);
    setData(data);
  };
  fetchData();
}, [url]); // url is a dependency

// ❌ AVOID - Missing dependency or incorrect dependencies
useEffect(() => {
  const fetchData = async () => {
    const data = await fetch(url);
    setData(data);
  };
  fetchData();
}, []); // url should be in dependencies
```

**Cleanup functions:**

```typescript
// ✅ CORRECT
useEffect(() => {
  const interval = setInterval(() => {
    // periodic task
  }, 1000);

  return () => {
    clearInterval(interval);
  };
}, []);

// ❌ AVOID - Missing cleanup
useEffect(() => {
  const interval = setInterval(() => {
    // periodic task
  }, 1000);
}, []);
```

### Error Handling

**Always handle errors with try-catch** **Provide meaningful error messages**
**Use error boundaries for component-level error handling** **Log errors
appropriately**

```typescript
// ✅ CORRECT
export async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// ❌ AVOID
export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user;
}
```

**Use React Error Boundaries:**

```typescript
'use client';

class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
```

### Next.js Best Practices

**Use Server Components by default** **Only use `'use client'` when necessary
(interactive features)** **Use Next.js Image component for images** **Use
dynamic imports for large components** **Properly use App Router conventions**

```typescript
// ✅ CORRECT - Server Component (default)
export default async function ServerComponent() {
  const data = await fetch('/api/data');
  return <div>{data.title}</div>;
}

// ✅ CORRECT - Client Component (when needed)
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ❌ AVOID - Unnecessary client directive
'use client';

export default function StaticComponent() {
  return <div>Static content</div>;
}
```

**Image optimization:**

```typescript
import Image from 'next/image';

// ✅ CORRECT
<Image
  src="/images/logo.png"
  alt="Logo"
  width={500}
  height={300}
  priority
/>

// ❌ AVOID
<img src="/images/logo.png" alt="Logo" />
```

**Dynamic imports:**

```typescript
// ✅ CORRECT
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});

// ❌ AVOID
import { HeavyChart } from '@/components/HeavyChart';
```

### shadcn/ui Usage

**Always use provided components over native HTML elements** **Follow component
prop conventions** **Use `asChild` for composition patterns**

```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  return (
    <form>
      <div className="space-y-4">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}

// ❌ AVOID
export function LoginForm() {
  return (
    <form>
      <div className="space-y-4">
        <label>Email</label>
        <input type="email" />
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
```

**Button variants and sizes:**

```typescript
// ✅ CORRECT
<Button variant="default" size="md">Default</Button>
<Button variant="destructive" size="md">Destructive</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="ghost" size="lg">Large Ghost</Button>
```

**Use `asChild` for composition:**

```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function NavLink() {
  return (
    <Button asChild variant="ghost">
      <Link href="/dashboard">Dashboard</Link>
    </Button>
  );
}
```

### Accessibility (a11y)

**Always provide alt text for images** **Use semantic HTML elements** **Ensure
keyboard navigation works** **Provide ARIA labels when necessary**

```typescript
// ✅ CORRECT
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Company Logo"
  width={100}
  height={100}
/>

<button
  aria-label="Close dialog"
  onClick={onClose}
>
  <span aria-hidden="true">×</span>
</button>

// ❌ AVOID
<img src="/logo.png" />
<button onClick={onClose}>
  <span>×</span>
</button>
```

### Performance Optimization

**Use React.memo for expensive components** **Use useMemo for expensive
computations** **Use useCallback for functions passed to children** **Avoid
unnecessary re-renders**

```typescript
// ✅ CORRECT
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ items }: Props) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.id.localeCompare(b.id));
  }, [items]);

  const handleClick = useCallback((id: string) => {
    onItemSelect(id);
  }, [onItemSelect]);

  return <div>{sortedItems.map(item => ...)}</div>;
});

// ❌ AVOID
export function ExpensiveComponent({ items }: Props) {
  const sortedItems = items.sort((a, b) => a.id.localeCompare(b.id));

  const handleClick = (id: string) => {
    onItemSelect(id);
  };

  return <div>{sortedItems.map(item => ...)}</div>;
}
```

## Code Review System

### Automated Code Review

The project includes a custom code review system that automatically checks:

**Code Quality:**

- TypeScript type safety and strict mode
- React Hooks best practices
- Code style and formatting
- Naming conventions
- Error handling

**Security:**

- Sensitive data detection (API keys, tokens)
- XSS/CSRF prevention
- Input validation
- Dependency vulnerabilities
- Unsafe function usage (eval, innerHTML)

**Performance:**

- Next.js optimizations (Image component, dynamic imports, ISR)
- React performance (useMemo, useCallback, React.memo)
- Bundle size optimization
- Memory leak detection
- File size and complexity analysis

**UI/UX:**

- shadcn/ui component usage
- Accessibility (ARIA, keyboard navigation)
- Responsive design
- Theme consistency
- User experience patterns

### Running Code Review

```bash
# Review a single file
node .claude/skills/code-review/scripts/index.js src/app/page.tsx

# Review entire directory
node .claude/skills/code-review/scripts/index.js src --directory

# Review specific dimension
node .claude/skills/code-review/scripts/index.js src/app/page.tsx --only-security
node .claude/skills/code-review/scripts/index.js src/app/page.tsx --only-performance
node .claude/skills/code-review/scripts/index.js src/app/page.tsx --only-uiux

# Review with output to file
node .claude/skills/code-review/scripts/index.js src/app/page.tsx --output review.json
```

### Understanding Review Results

Review scores:

- **A+ (90-100)**: Excellent, meets all best practices
- **A (85-89)**: Very good quality
- **B+ (80-84)**: Good, minor improvements needed
- **B (75-79)**: Needs improvement
- **C+ (70-74)**: Needs significant improvement
- **C (65-69)**: Poor quality
- **D (60-64)**: Needs major improvement
- **F (<60)**: Must fix all issues

Issue severity:

- **Critical**: Must fix before merging
- **Warning**: Should fix before merging
- **Info**: Suggested improvements

## File Organization

**Components:**

- Server Components: `src/app/` (default)
- UI Components: `src/components/ui/`
- Feature Components: `src/components/`
- Providers: `src/components/providers/`

**Libraries and Utilities:**

- `src/lib/utils.ts` - Utility functions
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `src/config/` - Application configuration

**Routing:**

- App Router: `src/app/`
- Use `<Link>` from `next/navigation` for navigation
- Use `useRouter` and `useSearchParams` hooks for programmatic navigation

## Testing Guidelines

### Unit Tests

**Test naming:** Should describe what is being tested

```typescript
// ✅ CORRECT
describe('formatDate', () => {
  it('should format date correctly', () => {
    expect(formatDate(new Date('2025-01-01'))).toBe('2025年1月1日');
  });

  it('should handle invalid dates', () => {
    expect(formatDate('invalid')).toBe('Invalid Date');
  });
});

// ❌ AVOID
describe('tests', () => {
  it('works', () => {
    expect(formatDate(new Date('2025-01-01'))).toBe('2025年1月1日');
  });
});
```

**Arrange-Act-Assert (AAA) pattern:**

```typescript
// Arrange
const date = new Date('2025-01-01');
const expected = '2025年1月1日';

// Act
const result = formatDate(date);

// Assert
expect(result).toBe(expected);
```

### Integration Tests

**Test user flows and features end-to-end** **Use real data where appropriate**
**Test error scenarios**

```typescript
// ✅ CORRECT
describe('User Login Flow', () => {
  it('should successfully login with valid credentials', async () => {
    const { login } = render(<LoginPage />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/邮箱/i), 'test@example.com');
      fireEvent.change(screen.getByLabelText(/密码/i), 'password123');
      fireEvent.click(screen.getByRole('button', { name: '提交' }));
    });

    await waitFor(() => {
      expect(screen.getByText(/欢迎/i)).toBeInTheDocument();
    });
  });

  it('should show error with invalid credentials', async () => {
    const { login } = render(<LoginPage />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/邮箱/i), 'invalid@email.com');
      fireEvent.change(screen.getByLabelText(/密码/i), 'wrongpassword');
      fireEvent.click(screen.getByRole('button', { name: '提交' }));
    });

    await waitFor(() => {
      expect(screen.getByText(/登录失败/i)).toBeInTheDocument();
    });
  });
});
```

## Pre-commit Hooks

Before committing code, the following checks run automatically:

1. **ESLint with auto-fix:** Catches and fixes code quality issues
2. **Prettier formatting:** Ensures consistent code formatting
3. **Lint-staged:** Only checks and formats staged files

```bash
# Run all checks manually
bun run precommit

# Run individual checks
bun run lint:fix    # ESLint fix
bun run format       # Prettier format
```

## Git Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `perf/` - Performance improvements
- `test/` - Testing related
- `chore/` - Build/toolchain changes

### Commit Messages

Follow Conventional Commits format:

```
<type>(<scope>): <subject>

<body>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Examples:

- `feat(auth): add GitHub OAuth login`
- `fix(ui): resolve button alignment issue`
- `docs(readme): update installation instructions`
- `style(components): format code with Prettier`
- `refactor(api): simplify user service`
- `perf(images): optimize image loading`
- `test(login): add OAuth flow tests`
- `chore(deps): upgrade to Next.js 16`

### Pull Request Guidelines

1. Update documentation if needed
2. Ensure all checks pass (ESLint, typecheck, tests)
3. Add description of changes
4. Link related issues
5. Squash commits if appropriate
6. Request review from maintainers

## CI/CD Integration

### GitHub Actions

**Continuous Integration:** Runs on every push and pull request

**Checks performed:**

1. Checkout code
2. Setup Bun environment
3. Install dependencies
4. Run ESLint
5. Run TypeScript type checking
6. Build project
7. Run tests (if configured)

**Code Review:** Automatically runs on pull requests and adds comments

### Docker Deployment

**Development:**

```bash
docker-compose up
```

**Production:**

```bash
docker-compose up -d
```

## Common Issues and Solutions

### TypeScript Errors

**Problem:** "Property 'x' does not exist on type 'Y'"

```typescript
// Solution: Ensure type includes the property
interface User {
  id: string;
  name: string;
  email?: string; // Optional property
}
```

### ESLint Errors

**Problem:** "No-unused-vars" warning

```typescript
// Solution: Use underscore prefix for intentionally unused variables
const fetchData = async (_id: string) => {
  // id is intentionally unused
  return await fetch(`/api/data`);
};
```

### Build Errors

**Problem:** "Module not found: @/components/ui/button"

```bash
# Solution: Check path aliases in tsconfig.json
# Ensure file exists at src/components/ui/button.tsx
```

### Runtime Errors

**Problem:** "Hydration failed because the initial UI does not match what was
rendered on the server"

```typescript
// Solution: Use suppressHydrationWarning prop on html or body element
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

## Best Practices Summary

1. **Always run type checking:** `bun run typecheck`
2. **Always run linting before committing:** `bun run lint:fix`
3. **Always run code review:**
   `node .claude/skills/code-review/scripts/index.js <file>`
4. **Write tests for new features:** Maintain code quality
5. **Use TypeScript strict mode:** Catch errors early
6. **Follow shadcn/ui patterns:** Use provided components
7. **Optimize for performance:** Use memo, useMemo, dynamic imports
8. **Ensure accessibility:** Test keyboard navigation and screen readers
9. **Handle errors gracefully:** Use try-catch and error boundaries
10. **Keep components small and focused:** Easier to test and maintain

## Getting Help

If you encounter issues or need clarification:

1. Check existing issues in the repository
2. Review this document for specific guidelines
3. Ask for clarification on specific tasks
4. Provide error messages and reproduction steps

Remember: When in doubt, prefer code that is:

- Type-safe
- Well-tested
- Accessible
- Performant
- Maintainable
