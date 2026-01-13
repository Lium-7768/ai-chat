import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import './globals.css';
import { AuthProvider, QueryProvider, ThemeProvider } from '@/components/providers';
import { I18nProvider } from '@/components/providers/i18n-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'AI Chat - Modern Conversational AI',
    template: '%s | AI Chat',
  },
  description:
    'A modern AI chat application built with Next.js, shadcn/ui and powered by advanced LLMs.',
  keywords: ['AI', 'Chat', 'Next.js', 'React', 'Tailwind CSS', 'LLM'],
  authors: [{ name: 'AAXIS' }],
  creator: 'AAXIS',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <I18nProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Suspense>
                <AuthProvider>{children}</AuthProvider>
              </Suspense>
            </ThemeProvider>
          </I18nProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
