import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  // Redirect to the default locale version of the contact page
  redirect(`/${defaultLocale}/contact`);
} 