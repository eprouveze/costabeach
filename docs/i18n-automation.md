# Internationalization Automation

This document describes the automated i18n tools and workflows set up for this project.

## Overview

The project uses **i18next-parser** and custom scripts to automatically manage translations, ensuring:
- ✅ Complete translation coverage across all locales
- ✅ Detection of hardcoded text that should be translated  
- ✅ Consistent translation structure between languages
- ✅ Parameter validation for interpolated strings
- ✅ Translation quality metrics and reporting

## Available Scripts

### Core Commands

```bash
# Extract all translation keys from code
npm run i18n:extract

# Validate translation completeness and consistency
npm run i18n:validate

# Full check (extract + validate, fail on missing translations)
npm run i18n:check

# Strict validation (extract + validate + find hardcoded text)
npm run i18n:check-strict

# Generate translation statistics report
npm run i18n:stats

# Quick extract + stats report
npm run i18n:report

# Find potentially hardcoded text
npm run i18n:find-hardcoded
```

### Integration Commands

```bash
# Development build (extracts translations, non-blocking)
npm run build

# Pre-commit validation (includes i18n checks)
npm run precommit-check
```

## How It Works

### 1. Automatic Key Extraction

The `i18next-parser` scans your codebase for:
- `t("key")` function calls in React components
- `useI18n()` hook usage  
- JSX attributes like `i18nKey`, `title`, `alt`
- Translation keys in all TypeScript/JavaScript files

**Configuration**: `i18next-parser.config.js`
- Input patterns: `app/**/*.{tsx,ts}`, `src/**/*.{tsx,ts}`
- Output: `src/lib/i18n/locales/{locale}.json`
- Supports our custom `t()` function and `useI18n` hook

### 2. Translation Validation

The validation script checks:
- **Structure consistency**: All locales have the same keys
- **Missing translations**: Keys present in source language but missing in targets
- **Empty translations**: Keys with empty string values
- **Parameter consistency**: Interpolation parameters match across locales

### 3. Hardcoded Text Detection

Scans for strings that should probably be translated:
- Identifies user-facing text not wrapped in `t()` calls
- Filters out technical strings (variables, URLs, etc.)
- Provides context and line numbers for each finding

### 4. Quality Metrics

Generates comprehensive reports on:
- Translation completion rates per locale
- Namespace-level coverage breakdown
- Duplicate translation detection
- Long/short translation analysis
- Parameter usage statistics

## Workflow Integration

### Development Workflow

1. **Write code with translation keys**:
   ```tsx
   const { t } = useI18n();
   return <h1>{t("page.title")}</h1>;
   ```

2. **Extract new keys**:
   ```bash
   npm run i18n:extract
   ```

3. **Check coverage**:
   ```bash
   npm run i18n:stats
   ```

4. **Fill in missing translations** in locale files

5. **Validate completeness**:
   ```bash
   npm run i18n:validate
   ```

### Pre-Commit Workflow

The pre-commit hook automatically:
1. Validates Prisma naming consistency
2. Runs ESLint checks
3. Extracts and validates translations
4. Fails commit if critical i18n issues found

### CI/CD Integration

For production deployments, use:
```bash
npm run i18n:check-strict
```

This ensures:
- All translations are complete
- No hardcoded text exists
- Translation structure is consistent

## Configuration Files

### `i18next-parser.config.js`

Main configuration for automatic extraction:
- **locales**: `['fr', 'en', 'ar']` (French is source)
- **functions**: `['t']` (our translation function)
- **namespaceFunctions**: `['useI18n']` (our custom hook)
- **lexers**: JSX and JavaScript parsers for React/Next.js

### Translation File Structure

```
src/lib/i18n/locales/
├── fr.json (source language)
├── en.json 
└── ar.json
```

Each file contains nested objects:
```json
{
  "admin": {
    "dashboard": "Tableau de bord",
    "users": "Utilisateurs"
  },
  "common": {
    "loading": "Chargement...",
    "save": "Enregistrer"
  }
}
```

## Best Practices

### 1. Translation Keys

- Use nested namespaces: `admin.users.title`
- Keep keys descriptive: `auth.signin.emailPlaceholder`
- Group related keys: `documents.upload.*`

### 2. Writing Translatable Code

✅ **Good**:
```tsx
const { t } = useI18n();
return <button>{t("common.save")}</button>;
```

❌ **Bad**:
```tsx
return <button>Save</button>; // Hardcoded text
```

### 3. Parameters and Interpolation

✅ **Good**:
```tsx
t("user.welcome", { name: user.name })
// JSON: "user.welcome": "Welcome {{name}}!"
```

❌ **Bad**:
```tsx
`Welcome ${user.name}!` // Not translatable
```

### 4. Handling Plurals

For languages with complex plural rules (like Arabic):
```json
{
  "notifications": {
    "unreadCount_zero": "No notifications",
    "unreadCount_one": "1 notification", 
    "unreadCount_two": "2 notifications",
    "unreadCount_few": "{{count}} notifications",
    "unreadCount_many": "{{count}} notifications",
    "unreadCount_other": "{{count}} notifications"
  }
}
```

## Troubleshooting

### Common Issues

**1. Missing translation keys after extraction**
- Check if `t()` calls use string literals (not variables)
- Ensure files are included in input patterns
- Run `npm run i18n:extract` to refresh

**2. Validation failures**
- Review missing keys listed in validation output
- Check for typos in translation keys
- Verify parameter consistency across locales

**3. Build failures**
- Use `npm run i18n:extract` instead of `npm run i18n:check` for development
- Check console output for specific validation errors
- Run `npm run i18n:stats` to see completion status

### Getting Help

1. **View detailed statistics**: `npm run i18n:stats`
2. **Check specific validation issues**: `npm run i18n:validate`
3. **Find hardcoded text**: `npm run i18n:find-hardcoded`
4. **Extract latest keys**: `npm run i18n:extract`

## Future Enhancements

Potential improvements to consider:
- Integration with translation services (Google Translate, DeepL)
- Automated translation suggestion workflow
- VS Code extension integration for inline translation editing
- GitHub Actions integration for PR validation
- Translation memory and consistency checking

## Examples

### Adding a New Feature with Translations

1. **Create the feature with translation keys**:
   ```tsx
   // components/NewFeature.tsx
   export function NewFeature() {
     const { t } = useI18n();
     return (
       <div>
         <h2>{t("newFeature.title")}</h2>
         <p>{t("newFeature.description")}</p>
         <button>{t("newFeature.action")}</button>
       </div>
     );
   }
   ```

2. **Extract the keys**:
   ```bash
   npm run i18n:extract
   ```

3. **Add French translations** (source language):
   ```json
   // src/lib/i18n/locales/fr.json
   {
     "newFeature": {
       "title": "Nouvelle Fonctionnalité",
       "description": "Description de la nouvelle fonctionnalité",
       "action": "Commencer"
     }
   }
   ```

4. **Add other language translations**:
   ```json
   // src/lib/i18n/locales/en.json  
   {
     "newFeature": {
       "title": "New Feature",
       "description": "Description of the new feature", 
       "action": "Get Started"
     }
   }
   ```

5. **Validate completeness**:
   ```bash
   npm run i18n:validate
   ```

This automated workflow ensures all translations are properly managed and no text is left untranslated!