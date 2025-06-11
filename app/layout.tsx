import '../src/styles/globals.css';
import ClientLayout from '@/components/ClientLayout';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Costa Beach 3 - Homeowners Association Portal',
  description: 'Official portal for Costa Beach 3 homeowners, providing access to documents, community information, and property management resources.',
};

// Use a more generic type to avoid conflicts with Next.js generated types
export default function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: any; // Using any to avoid type conflicts
}) {
  // Extract the locale from params, defaulting to 'fr'
  const locale = params.locale || 'fr';
  
  // Set RTL direction for Arabic
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <html lang={locale} dir={dir}>
      <body className="font-sans">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}