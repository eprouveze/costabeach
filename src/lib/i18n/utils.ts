import { Locale, defaultLocale, locales } from './config';

// Cache for translations to avoid repeated fetching
const translationCache: Record<Locale, any> = {
  fr: {},
  ar: {},
  en: {}
};

/**
 * Load translations for a specific locale
 */
export async function loadTranslations(locale: Locale): Promise<Record<string, any>> {
  // Return from cache if available
  if (translationCache[locale]) {
    return translationCache[locale];
  }
  
  try {
    // Dynamic import of the translation file
    const translations = await import(`./locales/${locale}.json`).then(
      (module) => module.default
    );
    
    // Cache the translations
    translationCache[locale] = translations;
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    
    // Fallback to default locale if the requested locale fails
    if (locale !== defaultLocale) {
      console.warn(`Falling back to ${defaultLocale} translations`);
      return loadTranslations(defaultLocale);
    }
    
    // Return empty object if even default locale fails
    return {};
  }
}

/**
 * Get a translation by key
 */
export function getTranslation(
  translations: Record<string, any>,
  key: string
): string {
  const keys = key.split('.');
  let result = translations;
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key; // Fallback to key if translation not found
    }
  }
  
  return typeof result === 'string' ? result : key;
}

/**
 * Format a date according to the locale
 */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a number according to the locale
 */
export function formatNumber(num: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(num);
} 