#!/usr/bin/env node

/**
 * Translation Validation Script
 * Validates translation files for completeness, consistency, and missing keys
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/lib/i18n/locales');
const SUPPORTED_LOCALES = ['fr', 'en', 'ar'];
const SOURCE_LOCALE = 'fr'; // French is our source language

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadTranslations(locale) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`❌ Error loading ${locale}.json: ${error.message}`, 'red');
    return null;
  }
}

function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

function validateTranslationStructure() {
  log('🔍 Validating translation structure...', 'blue');
  
  const translations = {};
  const allKeys = {};
  let hasErrors = false;
  
  // Load all translation files
  for (const locale of SUPPORTED_LOCALES) {
    translations[locale] = loadTranslations(locale);
    if (!translations[locale]) {
      hasErrors = true;
      continue;
    }
    allKeys[locale] = getAllKeys(translations[locale]);
  }
  
  if (hasErrors) {
    return false;
  }
  
  // Compare keys between locales
  const sourceKeys = new Set(allKeys[SOURCE_LOCALE]);
  
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === SOURCE_LOCALE) continue;
    
    const targetKeys = new Set(allKeys[locale]);
    const missingKeys = [...sourceKeys].filter(key => !targetKeys.has(key));
    const extraKeys = [...targetKeys].filter(key => !sourceKeys.has(key));
    
    if (missingKeys.length > 0) {
      log(`❌ Missing keys in ${locale}.json:`, 'red');
      missingKeys.forEach(key => log(`  - ${key}`, 'red'));
      hasErrors = true;
    }
    
    if (extraKeys.length > 0) {
      log(`⚠️  Extra keys in ${locale}.json (not in source):`, 'yellow');
      extraKeys.forEach(key => log(`  - ${key}`, 'yellow'));
    }
    
    if (missingKeys.length === 0 && extraKeys.length === 0) {
      log(`✅ ${locale}.json structure matches source`, 'green');
    }
  }
  
  return !hasErrors;
}

function validateEmptyTranslations() {
  log('\\n🔍 Checking for empty translations...', 'blue');
  
  let hasErrors = false;
  
  for (const locale of SUPPORTED_LOCALES) {
    const translations = loadTranslations(locale);
    if (!translations) continue;
    
    const keys = getAllKeys(translations);
    const emptyKeys = [];
    
    for (const key of keys) {
      const keyPath = key.split('.');
      let value = translations;
      
      for (const segment of keyPath) {
        value = value[segment];
      }
      
      if (typeof value === 'string' && value.trim() === '') {
        emptyKeys.push(key);
      }
    }
    
    if (emptyKeys.length > 0) {
      log(`⚠️  Empty translations in ${locale}.json:`, 'yellow');
      emptyKeys.forEach(key => log(`  - ${key}`, 'yellow'));
      if (locale !== SOURCE_LOCALE) {
        hasErrors = true;
      }
    } else {
      log(`✅ No empty translations in ${locale}.json`, 'green');
    }
  }
  
  return !hasErrors;
}

function validateParameterConsistency() {
  log('\\n🔍 Checking parameter consistency...', 'blue');
  
  const translations = {};
  for (const locale of SUPPORTED_LOCALES) {
    translations[locale] = loadTranslations(locale);
  }
  
  const sourceKeys = getAllKeys(translations[SOURCE_LOCALE]);
  let hasErrors = false;
  
  for (const key of sourceKeys) {
    const keyPath = key.split('.');
    const sourceValue = getValueByPath(translations[SOURCE_LOCALE], keyPath);
    
    if (typeof sourceValue !== 'string') continue;
    
    // Extract parameters like {{param}} from source
    const sourceParams = sourceValue.match(/{{\\s*\\w+\\s*}}/g) || [];
    const sourceParamNames = sourceParams.map(p => p.replace(/[{}\\s]/g, ''));
    
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === SOURCE_LOCALE) continue;
      
      const targetValue = getValueByPath(translations[locale], keyPath);
      if (typeof targetValue !== 'string') continue;
      
      const targetParams = targetValue.match(/{{\\s*\\w+\\s*}}/g) || [];
      const targetParamNames = targetParams.map(p => p.replace(/[{}\\s]/g, ''));
      
      const missingParams = sourceParamNames.filter(p => !targetParamNames.includes(p));
      const extraParams = targetParamNames.filter(p => !sourceParamNames.includes(p));
      
      if (missingParams.length > 0 || extraParams.length > 0) {
        log(`❌ Parameter mismatch in ${locale} for key "${key}":`, 'red');
        if (missingParams.length > 0) {
          log(`  Missing: ${missingParams.join(', ')}`, 'red');
        }
        if (extraParams.length > 0) {
          log(`  Extra: ${extraParams.join(', ')}`, 'red');
        }
        hasErrors = true;
      }
    }
  }
  
  if (!hasErrors) {
    log('✅ All parameter usage is consistent', 'green');
  }
  
  return !hasErrors;
}

function getValueByPath(obj, path) {
  let value = obj;
  for (const segment of path) {
    if (value && typeof value === 'object') {
      value = value[segment];
    } else {
      return undefined;
    }
  }
  return value;
}

function generateTranslationStats() {
  log('\\n📊 Translation Statistics:', 'cyan');
  
  for (const locale of SUPPORTED_LOCALES) {
    const translations = loadTranslations(locale);
    if (!translations) continue;
    
    const keys = getAllKeys(translations);
    const totalKeys = keys.length;
    
    let translatedKeys = 0;
    let emptyKeys = 0;
    
    for (const key of keys) {
      const value = getValueByPath(translations, key.split('.'));
      if (typeof value === 'string') {
        if (value.trim() === '') {
          emptyKeys++;
        } else {
          translatedKeys++;
        }
      }
    }
    
    const completionRate = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;
    
    log(`📈 ${locale.toUpperCase()}: ${translatedKeys}/${totalKeys} keys (${completionRate}%)`, 'cyan');
    if (emptyKeys > 0) {
      log(`   ${emptyKeys} empty translations`, 'yellow');
    }
  }
}

function main() {
  log('🌐 Translation Validation Tool', 'bold');
  log('==============================\\n', 'bold');
  
  const structureValid = validateTranslationStructure();
  const emptyValid = validateEmptyTranslations();
  const parametersValid = validateParameterConsistency();
  
  generateTranslationStats();
  
  log('\\n==============================', 'bold');
  
  if (structureValid && emptyValid && parametersValid) {
    log('✅ All translations are valid!', 'green');
    process.exit(0);
  } else {
    log('❌ Translation validation failed!', 'red');
    log('Please fix the issues above before continuing.', 'red');
    process.exit(1);
  }
}

main();