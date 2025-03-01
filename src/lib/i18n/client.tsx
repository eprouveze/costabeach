"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, defaultLocale, locales } from "./config";
import { loadTranslations } from "./utils";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isLoading: boolean;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract locale from pathname or use default
    const pathLocale = pathname.split("/")[1] as Locale;
    const currentLocale = locales.includes(pathLocale as Locale) 
      ? pathLocale as Locale 
      : defaultLocale;
    
    setLocaleState(currentLocale);
    
    // Load translations for the current locale
    loadTranslations(currentLocale)
      .then((data) => {
        setTranslations(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load translations:", error);
        setIsLoading(false);
      });
  }, [pathname]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    
    setIsLoading(true);
    setLocaleState(newLocale);
    
    // Update URL to reflect locale change
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    
    router.push(segments.join("/"));
    
    // Load new translations
    loadTranslations(newLocale)
      .then((data) => {
        setTranslations(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load translations:", error);
        setIsLoading(false);
      });
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let result = translations;
    
    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k] as any;
      } else {
        return key; // Fallback to key if translation not found
      }
    }
    
    return typeof result === "string" ? result : key;
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