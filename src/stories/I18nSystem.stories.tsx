import type { Meta, StoryObj } from "@storybook/react";

const I18nSystemDocs = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Internationalization (i18n) System</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          The Costa Beach HOA Portal supports multiple languages to serve its diverse user base. 
          The internationalization system is built on Next.js with custom hooks and utilities 
          to provide a seamless multilingual experience.
        </p>
        <p className="mb-4">
          Currently, the application supports the following languages:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>French (fr)</strong> - Default language</li>
          <li><strong>Arabic (ar)</strong> - With RTL (Right-to-Left) support</li>
          <li><strong>English (en)</strong> - As a fallback language</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Key Components</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">I18nProvider</h3>
          <p className="mb-2">
            A context provider that manages the current locale and provides translation functions.
            All components that use the <code>useI18n</code> hook must be wrapped in this provider.
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4 overflow-x-auto">
            {`// In your root layout.tsx
import { I18nProvider } from "@/lib/i18n/client";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}`}
          </pre>
          <div className="bg-amber-50 dark:bg-amber-900 p-4 rounded-md mb-4">
            <h4 className="font-medium mb-2">⚠️ Storybook Usage</h4>
            <p>
              For Storybook, we've implemented a global mock for the I18n system. This is done through:
            </p>
            <ol className="list-decimal pl-6 mt-2 mb-2">
              <li>A mock implementation in <code>.storybook/mockI18n.tsx</code></li>
              <li>A webpack alias in <code>.storybook/main.ts</code> that redirects imports</li>
              <li>A global decorator in <code>.storybook/preview.tsx</code></li>
            </ol>
            <p className="mt-2">
              This approach ensures that all components using the <code>useI18n</code> hook 
              work correctly in Storybook without needing individual mocks in each story.
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mt-2 overflow-x-auto">
              {`// .storybook/mockI18n.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Locale, defaultLocale } from '../src/lib/i18n/config';

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isLoading: boolean;
  isRTL: boolean;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const isRTL = locale === 'ar';
  
  return (
    <I18nContext.Provider value={{
      locale,
      setLocale: (newLocale) => setLocale(newLocale),
      t: (key) => key,
      isLoading: false,
      isRTL
    }}>
      {children}
    </I18nContext.Provider>
  );
}

// .storybook/main.ts (in webpackFinal)
config.resolve.alias = {
  ...config.resolve.alias,
  "@/lib/i18n/client": path.resolve(__dirname, "./mockI18n"),
};

// .storybook/preview.tsx
import { withI18nProvider } from "./mockI18n";

const preview = {
  decorators: [
    withI18nProvider,
    // other decorators...
  ],
};`}
            </pre>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">LanguageSwitcher</h3>
          <p className="mb-2">
            A reusable component that allows users to change the application language.
            It supports two variants:
          </p>
          <ul className="list-disc pl-6 mb-2">
            <li><strong>Dropdown</strong> - A dropdown menu showing the current language with options to switch</li>
            <li><strong>Buttons</strong> - A set of buttons for each available language</li>
          </ul>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4 overflow-x-auto">
            {`// Example usage
<LanguageSwitcher variant="dropdown" />
<LanguageSwitcher variant="buttons" />`}
          </pre>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">DirectionProvider</h3>
          <p className="mb-2">
            A client component that sets the HTML dir attribute based on the current locale,
            enabling proper RTL support for Arabic.
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4 overflow-x-auto">
            {`// Automatically used in the root layout
<DirectionProvider>
  {children}
</DirectionProvider>`}
          </pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Translation Hooks</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Client-side: useI18n</h3>
          <p className="mb-2">
            A React hook for accessing translations in client components.
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4 overflow-x-auto">
            {`"use client";

import { useI18n } from "@/lib/i18n/client";

export function MyComponent() {
  const { t, locale, isRTL, setLocale } = useI18n();
  
  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <p>Current language: {locale}</p>
      <button onClick={() => setLocale("fr")}>Switch to French</button>
    </div>
  );
}`}
          </pre>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Server-side: useTranslation</h3>
          <p className="mb-2">
            A function for accessing translations in server components.
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4 overflow-x-auto">
            {`import { useTranslation } from "@/lib/i18n/server";

export default async function ServerComponent() {
  const { t, locale, isRTL } = await useTranslation();
  
  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <p>Current language: {locale}</p>
    </div>
  );
}`}
          </pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Translation Files</h2>
        <p className="mb-4">
          Translations are stored in JSON files under <code>src/lib/i18n/locales/</code> with one file per language:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><code>fr.json</code> - French translations</li>
          <li><code>ar.json</code> - Arabic translations</li>
          <li><code>en.json</code> - English translations</li>
        </ul>
        <p className="mb-4">
          The translation files use a nested structure organized by feature area:
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4 overflow-x-auto">
          {`{
  "common": {
    "welcome": "Welcome",
    "loading": "Loading...",
    "error": "Error",
    // ...
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    // ...
  },
  "documents": {
    "title": "Documents",
    "upload": "Upload",
    // ...
  }
}`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Language Detection</h2>
        <p className="mb-4">
          The system detects the user's preferred language through:
        </p>
        <ol className="list-decimal pl-6 mb-4">
          <li>Cookie (<code>NEXT_LOCALE</code>) - Persists the user's language choice</li>
          <li>Accept-Language header - Uses the browser's language preference</li>
          <li>Default locale (French) - Fallback when no preference is detected</li>
        </ol>
        <p className="mb-4">
          This logic is implemented in the Next.js middleware (<code>src/middleware.ts</code>).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Always use translation keys instead of hardcoded strings</li>
          <li>Organize translation keys by feature area</li>
          <li>Use the appropriate hook based on component type (client vs server)</li>
          <li>Test your components with different languages to ensure proper layout</li>
          <li>Be mindful of text expansion in different languages (some languages may require more space)</li>
          <li>For RTL languages, ensure that directional UI elements (arrows, icons) are properly mirrored</li>
        </ul>
      </section>
    </div>
  );
};

const meta = {
  title: "Documentation/I18n System",
  component: I18nSystemDocs,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof I18nSystemDocs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {}; 