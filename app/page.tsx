import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n';

// Force this page to be dynamically rendered
export const dynamic = 'force-dynamic';

// Redirect to the default locale homepage
export default function RootPage() {
  redirect(`/${defaultLocale}`);
} 