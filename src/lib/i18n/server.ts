import { cookies, headers } from 'next/headers';
import { Locale, defaultLocale, locales } from './config';
import { loadTranslations, getTranslation, formatDate, formatNumber } from './utils';

/**
 * Get the current locale from the request
 */
export async function getLocale(): Promise<Locale> {
  // Try to get locale from cookies
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  
  if (localeCookie?.value && locales.includes(localeCookie.value as Locale)) {
    return localeCookie.value as Locale;
  }
  
  // Try to get locale from Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('Accept-Language');
  
  if (acceptLanguage) {
    // Parse the Accept-Language header
    const preferredLocales = acceptLanguage
      .split(',')
      .map(locale => locale.split(';')[0].trim());
    
    // Find the first locale that we support
    for (const locale of preferredLocales) {
      const shortLocale = locale.substring(0, 2);
      if (locales.includes(shortLocale as Locale)) {
        return shortLocale as Locale;
      }
    }
  }
  
  // Default to French
  return defaultLocale;
}

/**
 * Server-side translation hook
 */
export async function useTranslation(locale?: Locale) {
  const currentLocale = locale || await getLocale();
  const translations = await loadTranslations(currentLocale);
  
  return {
    t: (key: string) => getTranslation(translations, key),
    locale: currentLocale,
    isRTL: currentLocale === 'ar',
    formatDate: (date: string | Date, locale?: Locale) => 
      formatDate(typeof date === 'string' ? new Date(date) : date, locale || currentLocale),
    formatNumber: (num: number, locale?: Locale) => 
      formatNumber(num, locale || currentLocale)
  };
} 