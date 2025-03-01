import type { Meta } from "@storybook/react";

const I18nSystemDocs = () => {
  return (
    <div className="max-w-4xl mx-auto">
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

const meta: Meta<typeof I18nSystemDocs> = {
  title: "Documentation/I18n System",
  component: I18nSystemDocs,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Documentation = {}; 