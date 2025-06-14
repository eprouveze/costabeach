export default {
  // Supported locales
  locales: ['fr', 'en', 'ar'],
  
  // Default locale (source language)
  defaultLocale: 'fr',
  
  // Default namespace
  defaultNamespace: 'translation',
  
  // Input file patterns - scan all relevant files
  input: [
    'app/**/*.{js,jsx,ts,tsx}',
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**'
  ],
  
  // Output pattern for translation files
  output: 'src/lib/i18n/locales/$LOCALE.json',
  
  // Indentation for JSON files
  indentation: 2,
  
  // Sort keys alphabetically
  sort: true,
  
  // Keep existing translations that are no longer found in code
  keepRemoved: false,
  
  // Create backup of old catalogs before updating
  createOldCatalogs: false,
  
  // Default value for missing keys
  defaultValue: '',
  
  // Key separator for nested keys
  keySeparator: '.',
  
  // Namespace separator
  namespaceSeparator: ':',
  
  // Context separator
  contextSeparator: '_',
  
  // Plural separator
  pluralSeparator: '_',
  
  // Lexer configuration for different file types
  lexers: {
    js: [
      {
        lexer: 'JsxLexer',
        functions: ['t'], // Our custom t function from useI18n
        namespaceFunctions: ['useI18n'], // Our custom hook
        // Extract keys from JSX attributes
        attr: ['i18nKey', 'title', 'alt'],
        // Component functions that contain translations
        componentFunctions: ['Trans'],
        // Transform function for keys
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
      }
    ],
    jsx: [
      {
        lexer: 'JsxLexer',
        functions: ['t'],
        namespaceFunctions: ['useI18n'],
        attr: ['i18nKey', 'title', 'alt'],
        componentFunctions: ['Trans'],
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
      }
    ],
    ts: [
      {
        lexer: 'JavascriptLexer',
        functions: ['t'],
        namespaceFunctions: ['useI18n']
      }
    ],
    tsx: [
      {
        lexer: 'JsxLexer',
        functions: ['t'],
        namespaceFunctions: ['useI18n'],
        attr: ['i18nKey', 'title', 'alt'],
        componentFunctions: ['Trans'],
        transSupportBasicHtmlNodes: true,
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
      }
    ]
  },
  
  // Fail on missing translations
  failOnUpdate: false,
  
  // Fail on warnings
  failOnWarnings: false,
  
  // Verbose output
  verbose: false,
  
  // Use i18next format for plurals
  useKeysAsDefaultValue: false
};