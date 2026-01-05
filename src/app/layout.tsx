import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/components/auth-provider';
import Header from '@/components/header';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'CareerCompass',
  description: 'Your guide to finding the perfect job fit.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          inter.variable
        )}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
