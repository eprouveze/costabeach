import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Costa Beach 3 - Homeowners Association Portal',
  description: 'Official portal for Costa Beach 3 homeowners, providing access to documents, community information, and property management resources.',
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  // Extract the locale from params, defaulting to 'fr'
  const locale = params.locale || 'fr';
  
  // Set RTL direction for Arabic
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <html lang={locale} dir={dir}>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}