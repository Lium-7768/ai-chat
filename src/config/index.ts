export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME ?? 'AI Chat',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    description: 'A modern AI chat application built with Next.js and shadcn/ui',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'your-secret-key-change-in-production',
    jwtExpiration: '7d',
    sessionMaxAge: 60 * 60 * 24 * 7,
  },
  oauth: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      redirectUri:
        process.env.GITHUB_REDIRECT_URI ?? 'http://localhost:3000/api/auth/github/callback',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
    enableBetaFeatures: process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES === 'true',
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  api: {
    timeout: 30000,
    retries: 3,
  },
  ui: {
    defaultTheme: 'system',
    themeColors: {
      primary: 'blue',
      secondary: 'purple',
    },
  },
} as const;

export type AppConfig = typeof config;
