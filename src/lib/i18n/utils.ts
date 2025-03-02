import { Locale, defaultLocale, locales } from './config';

// Import all translation files directly
import frTranslations from './locales/fr.json';
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

// Map of all translations
const allTranslations: Record<Locale, Record<string, any>> = {
  fr: frTranslations,
  ar: arTranslations,
  en: enTranslations,
};

// Cache for translations to avoid repeated fetching
const translationCache: Record<Locale, Record<string, Record<string, any>>> = {} as Record<
  Locale,
  Record<string, Record<string, any>>
>;

// Initialize cache for each locale
locales.forEach(locale => {
  translationCache[locale] = {};
});

/**
 * Load translations for a specific locale
 */
export async function loadTranslations(
  locale: Locale,
  namespace: string = 'common'
): Promise<Record<string, any>> {
  console.log(`[loadTranslations] Loading translations for locale: ${locale}, namespace: ${namespace}`);
  
  // Return from cache if available and has the namespace
  if (
    translationCache[locale] && 
    translationCache[locale][namespace]
  ) {
    console.log(`[loadTranslations] Using cached translations for ${locale}`);
    return translationCache[locale][namespace];
  }
  
  try {
    // Get translations from the pre-imported object
    const translations = allTranslations[locale];
    
    if (!translations) {
      throw new Error(`No translations found for locale: ${locale}`);
    }
    
    console.log(`[loadTranslations] Successfully loaded translations for ${locale}`);
    console.log(`[loadTranslations] Translation keys:`, Object.keys(translations));
    
    // Initialize cache for this locale if it doesn't exist
    if (!translationCache[locale]) {
      translationCache[locale] = {};
    }
    
    // Cache the translations
    translationCache[locale][namespace] = translations;
    return translations;
  } catch (error) {
    console.error(`[loadTranslations] Error loading translations for ${locale}:`, error);
    
    // Fallback to default locale if the requested locale fails
    if (locale !== defaultLocale) {
      console.log(`[loadTranslations] Falling back to default locale: ${defaultLocale}`);
      console.warn(`Falling back to ${defaultLocale} translations`);
      return loadTranslations(defaultLocale, namespace);
    }
    
    // Return empty object if even default locale fails
    console.error(`[loadTranslations] Failed to load even default locale translations`);
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