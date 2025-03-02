import React, { createContext, useContext, ReactNode } from 'react';

type MockI18nContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  isLoading: boolean;
};

const MockI18nContext = createContext<MockI18nContextType | null>(null);

interface MockI18nProviderProps {
  children: ReactNode;
  locale?: string;
  messages?: Record<string, string>;
  timeZone?: string; // Not used but included for API compatibility
}

export function MockI18nProvider({
  children,
  locale = 'en',
  messages = {},
}: MockI18nProviderProps) {
  const t = (key: string): string => {
    if (messages && key in messages) {
      return messages[key];
    }
    
    // If the key is in dot notation, try to resolve it
    const keys = key.split('.');
    let result: any = messages;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Fallback to key if translation not found
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  const setLocale = (newLocale: string) => {
    console.log(`[MockI18nProvider] Would switch locale to ${newLocale} (no-op in Storybook)`);
  };

  return (
    <MockI18nContext.Provider value={{ locale, setLocale, t, isLoading: false }}>
      {children}
    </MockI18nContext.Provider>
  );
}

export function useMockI18n() {
  const context = useContext(MockI18nContext);
  if (!context) {
    throw new Error('useMockI18n must be used within a MockI18nProvider');
  }
  return context;
}

// This allows us to use the same hook name in Storybook
export const useI18n = useMockI18n; 