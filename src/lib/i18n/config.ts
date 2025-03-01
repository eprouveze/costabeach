export type Locale = 'fr' | 'ar' | 'en';

export const defaultLocale: Locale = 'fr';
export const locales: Locale[] = ['fr', 'ar', 'en'];

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  fr: 'ltr',
  ar: 'rtl',
  en: 'ltr',
}; 