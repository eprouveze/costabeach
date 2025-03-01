import { cookies, headers } from 'next/headers';
import { loadTranslations } from './utils';
import { Locale, defaultLocale, locales, localeDirections } from './config';

/**
 * Get the user's locale from cookies or headers
 */
export const getLocale = async (): Promise<Locale> => {
  try {
    // Get the cookie store - cookies() returns a promise in some environments
    const cookieStore = await cookies();
    
    // Check if the locale is set in cookies
    const localeCookie = cookieStore.get('NEXT_LOCALE');
    if (localeCookie?.value && locales.includes(localeCookie.value as Locale)) {
      return localeCookie.value as Locale;
    }
    
    // If no cookie, check the Accept-Language header
    const headersList = await headers();
    const acceptLanguage = headersList.get('Accept-Language');
    
    if (acceptLanguage) {
      // Parse the Accept-Language header
      const preferredLocales = acceptLanguage
        .split(',')
        .map((locale: string) => locale.split(';')[0].trim());
      
      // Find the first locale that is supported
      const matchedLocale = preferredLocales.find((locale: string) => 
        locales.includes(locale as Locale)
      );
      
      if (matchedLocale) {
        return matchedLocale as Locale;
      }
    }
    
    // Default to the default locale
    return defaultLocale;
  } catch (error) {
    console.error('Error getting locale:', error);
    return defaultLocale;
  }
};

/**
 * Server-side translation function
 */
export const useTranslation = async (locale?: Locale, namespace: string = 'common') => {
  try {
    // Use provided locale or get from request
    const currentLocale = locale || await getLocale();
    const translations = await loadTranslations(currentLocale, namespace);
    
    return {
      locale: currentLocale,
      isRTL: localeDirections[currentLocale] === 'rtl',
      t: (key: string) => {
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
          if (!value || typeof value !== 'object') return key;
          value = value[k];
        }
        
        return typeof value === 'string' ? value : key;
      },
    };
  } catch (error) {
    console.error('Error in useTranslation:', error);
    return {
      locale: defaultLocale,
      isRTL: localeDirections[defaultLocale] === 'rtl',
      t: (key: string) => key, // Return the key if there's an error
    };
  }
}; 