import type { Metadata } from 'next';
import { Manrope, Geist_Mono, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { NavigationProvider } from '@/components/layout/NavigationContext';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

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

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: '--font-devanagari',
  subsets: ['devanagari'],
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
      className={`${manrope.variable} ${geistMono.variable} ${notoSansDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-200">
        <LanguageProvider>
          <NavigationProvider>
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none w-full">
              {children}
            </main>
            <Footer />
          </NavigationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
