import React, { createContext, useContext, useState } from "react";
import { Locale, locales, defaultLocale } from "../src/lib/i18n/config";

// Define the same type as in the real implementation
type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isLoading: boolean;
  isRTL: boolean;
};

// Create a mock I18n context
export const I18nContext = createContext<I18nContextType | null>(null);

// Make sure the context has the same name as the real one
I18nContext.displayName = "I18nContext";

// Create a mock useI18n hook that returns the values our components expect
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Create a mock I18nProvider component
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  
  const value: I18nContextType = {
    locale,
    setLocale: (newLocale: Locale) => {
      console.log(`Setting locale to ${newLocale}`);
      setLocale(newLocale);
    },
    t: (key: string) => key,
    isLoading: false,
    isRTL: locale === "ar",
  };
  
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Create a decorator that wraps stories with the I18nProvider
export const withI18nProvider = (Story: React.ComponentType) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
); 