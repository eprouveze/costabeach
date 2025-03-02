import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getLocale } from '@/lib/i18n/server';
import { localeDirections } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Costa Beach 3 - Homeowners Association Portal',
  description: 'The official portal for Costa Beach 3 Homeowners Association. Access documents, community information, and HOA resources.',
};

import ClientLayout from '@/components/ClientLayout';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the locale from server utilities
  const locale = await getLocale();
  const htmlDir = localeDirections[locale] || 'ltr';

  return (
    <html lang={locale} dir={htmlDir}>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
} 