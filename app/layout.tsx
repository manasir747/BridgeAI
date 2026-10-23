import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BridgeAI — Societal Intelligence & Action Engine',
  description:
    'A Gemini-powered humanitarian platform converting messy, noisy real-world crisis, relief, and community inputs into structured, validated, actionable operations.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'BridgeAI — Societal Intelligence & Action Engine',
    description:
      'Transforming chaotic real-world inputs into structured, validated, actionable operations.',
    siteName: 'BridgeAI',
    type: 'website',
  },
};

import { NavigationProvider } from '@/components/layout/NavigationContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200">
        <NavigationProvider>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
            <div className="mx-auto max-w-7xl px-4">
              BridgeAI Foundation • Open Source Societal Benefit Architecture
            </div>
          </footer>
        </NavigationProvider>
      </body>
    </html>
  );
}
