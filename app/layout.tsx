import type { Metadata } from 'next';
import { Manrope, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { NavigationProvider } from '@/components/layout/NavigationContext';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-200">
        <NavigationProvider>
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none w-full">
            {children}
          </main>
          <footer className="border-t border-slate-800/80 py-5 text-center text-xs text-slate-400">
            <div className="w-full px-4 sm:px-6 lg:px-10">
              BridgeAI Foundation • Open Source Societal Benefit Architecture
            </div>
          </footer>
        </NavigationProvider>
      </body>
    </html>
  );
}
