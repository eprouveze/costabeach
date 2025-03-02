"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Locale, defaultLocale, locales } from "./config";
import { loadTranslations } from "./utils";

// Import translations directly
import frTranslations from './locales/fr.json';
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

const staticTranslations: Record<Locale, Record<string, any>> = {
  fr: frTranslations,
  ar: arTranslations,
  en: enTranslations,
};

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isLoading: boolean;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<Record<string, any>>(staticTranslations[defaultLocale] || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Extract locale from pathname or use default
    const pathSegments = pathname.split("/").filter(Boolean); // Remove empty segments
    const pathLocale = pathSegments.length > 0 ? pathSegments[0] as Locale : null;
    const currentLocale = pathLocale && locales.includes(pathLocale as Locale) 
      ? pathLocale as Locale 
      : defaultLocale;
    
    console.log('[I18nProvider] Current locale from path:', currentLocale);
    console.log('[I18nProvider] Path segments:', pathSegments);
    console.log('[I18nProvider] Full pathname:', pathname);
    
    setLocaleState(currentLocale);
    
    // Set translations directly from the static import
    if (staticTranslations[currentLocale]) {
      console.log('[I18nProvider] Using static translations for locale:', currentLocale);
      setTranslations(staticTranslations[currentLocale]);
      setIsLoading(false);
    } else {
      console.error('[I18nProvider] No static translations available for locale:', currentLocale);
      setTranslations(staticTranslations[defaultLocale] || {});
      setIsLoading(false);
    }
  }, [pathname]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    
    console.log(`[I18nProvider] Switching locale from ${locale} to ${newLocale}`);
    setIsLoading(true);
    setLocaleState(newLocale);
    
    // Update URL to reflect locale change
    const pathSegments = pathname.split("/").filter(Boolean); // Remove empty segments
    
    // Create a new path with the new locale
    let newPath: string;
    
    if (pathSegments.length > 0 && locales.includes(pathSegments[0] as Locale)) {
      // Replace the existing locale
      pathSegments[0] = newLocale;
      newPath = `/${pathSegments.join("/")}`;
    } else {
      // Add the locale if it doesn't exist
      newPath = `/${newLocale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
    }
    
    console.log(`[I18nProvider] New path after locale change: ${newPath}`);
    
    // Set a cookie to remember the locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    
    // Use window.location.href for a full page navigation, which is more reliable than router.push
    window.location.href = newPath;
    
    // We don't need to load translations here as the page will reload
  };

  const t = (key: string): string => {
    if (!translations || Object.keys(translations).length === 0) {
      console.log(`[I18nProvider] Translation lookup failed - no translations loaded for key: ${key}`);
      return key;
    }
    
    const keys = key.split(".");
    let result: any = translations;
    
    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
      } else {
        console.log(`[I18nProvider] Translation not found for key: ${key}, missing segment: ${k}`);
        return key; // Fallback to key if translation not found
      }
    }
    
    if (typeof result !== "string") {
      console.log(`[I18nProvider] Translation result is not a string for key: ${key}, type:`, typeof result);
      return key;
    }
    
    return result;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
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