import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n';

// Force dynamic rendering to ensure the redirect happens on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Root page that redirects to the default locale
 * This is a fallback in case middleware fails to redirect
 */
export default function RootPage() {
  // Log the redirection for debugging
  console.log(`[RootPage] Redirecting to default locale: /${defaultLocale}`);
  // Use Next.js redirect function to send user to the default locale page
  redirect(`/${defaultLocale}`);
} 