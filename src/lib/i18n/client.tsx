"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Locale, defaultLocale, locales, localeDirections } from "./config";
import { loadTranslations } from "./utils";

// Import translations directly
import frTranslations from './locales/fr.json';
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

// Set this to true only when debugging i18n issues
const DEBUG_I18N = false;

const staticTranslations: Record<Locale, Record<string, any>> = {
  fr: frTranslations,
  ar: arTranslations,
  en: enTranslations,
};

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isLoading: boolean;
  isRTL: boolean;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<Record<string, any>>(staticTranslations[defaultLocale] || {});
  const [isLoading, setIsLoading] = useState(false);
  const isRTL = locale === 'ar';

  useEffect(() => {
    // Extract locale from pathname or use default
    const pathSegments = pathname?.split("/").filter(Boolean) || []; // Remove empty segments
    const pathLocale = pathSegments.length > 0 ? pathSegments[0] as Locale : null;
    const currentLocale = pathLocale && locales.includes(pathLocale as Locale) 
      ? pathLocale as Locale 
      : defaultLocale;
    
    // Always set the locale regardless of whether we're loading translations
    setLocaleState(currentLocale);
    
    // Set translations directly from the static import
    if (staticTranslations[currentLocale]) {
      setTranslations(staticTranslations[currentLocale]);
      setIsLoading(false);
    } else {
      console.error('[I18nProvider] No static translations available for locale:', currentLocale);
      setTranslations(staticTranslations[defaultLocale] || {});
      setIsLoading(false);
    }

    // Also check for locale in localStorage as a fallback
    try {
      const storedLocale = localStorage.getItem('NEXT_LOCALE') as Locale | null;
      if (storedLocale && locales.includes(storedLocale) && currentLocale === defaultLocale && !pathLocale) {
        setLocaleState(storedLocale);
        setTranslations(staticTranslations[storedLocale] || staticTranslations[defaultLocale]);
      }
    } catch (e) {
      // Ignore localStorage errors (may happen in SSR)
      if (DEBUG_I18N) {
        console.log('[I18nProvider] Could not access localStorage:', e);
      }
    }
  }, [pathname]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    
    if (DEBUG_I18N) {
      console.log(`[I18nProvider] Switching locale from ${locale} to ${newLocale}`);
    }
    
    setIsLoading(true);
    setLocaleState(newLocale);
    
    // Update URL to reflect locale change
    const pathSegments = pathname?.split("/").filter(Boolean) || []; // Remove empty segments
    
    // Create a new path with the new locale
    let newPath: string;
    
    if (pathSegments.length > 0 && locales.includes(pathSegments[0] as Locale)) {
      // Replace the existing locale
      pathSegments[0] = newLocale;
      newPath = `/${pathSegments.join("/")}`;
    } else {
      // Add the locale if it doesn't exist
      newPath = `/${newLocale}${pathname?.startsWith('/') ? pathname : `/${pathname}`}`;
    }
    
    if (DEBUG_I18N) {
      console.log(`[I18nProvider] New path after locale change: ${newPath}`);
    }
    
    // Set a cookie to remember the locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    
    // Also store in localStorage as a backup
    try {
      localStorage.setItem('NEXT_LOCALE', newLocale);
    } catch (e) {
      if (DEBUG_I18N) {
        console.log('[I18nProvider] Could not save locale to localStorage:', e);
      }
    }
    
    // Use window.location.href for a full page navigation, which is more reliable than router.push
    window.location.href = newPath;
    
    // We don't need to load translations here as the page will reload
  };

  const t = (key: string, params?: Record<string, any>): string => {
    if (!translations || Object.keys(translations).length === 0) {
      if (DEBUG_I18N) {
        console.log(`[I18nProvider] Translation lookup failed - no translations loaded for key: ${key}`);
      }
      return key;
    }
    
    if (DEBUG_I18N) {
      console.log(`[I18nProvider] Looking up translation for key: ${key}, current locale: ${locale}`);
      console.log(`[I18nProvider] Available translations root keys:`, Object.keys(translations));
    }
    
    const keys = key.split(".");
    let result: any = translations;
    
    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
        if (DEBUG_I18N) {
          console.log(`[I18nProvider] Found segment "${k}" in translation tree, continuing...`);
        }
      } else {
        if (DEBUG_I18N) {
          console.log(`[I18nProvider] Translation not found for key: ${key}, missing segment: ${k}`);
          console.log(`[I18nProvider] Available keys at this level:`, result ? Object.keys(result) : 'none');
        }
        return key; // Fallback to key if translation not found
      }
    }
    
    if (typeof result !== "string") {
      if (DEBUG_I18N) {
        console.log(`[I18nProvider] Translation result is not a string for key: ${key}, type:`, typeof result);
      }
      return key;
    }
    
    if (DEBUG_I18N) {
      console.log(`[I18nProvider] Successfully translated "${key}" to "${result}"`);
    }
    
    // Replace parameters in the translation string
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramValue));
      }, result);
    }
    
    return result;
  };

  const contextValue: I18nContextType = {
    locale,
    setLocale,
    t,
    isLoading,
    isRTL
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
} 