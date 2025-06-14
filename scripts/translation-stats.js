#!/usr/bin/env node

/**
 * Translation Statistics Script
 * Provides detailed statistics about translation coverage and quality
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

function getNamespaceStats(translations) {
  const namespaces = {};
  
  for (const locale of SUPPORTED_LOCALES) {
    if (!translations[locale]) continue;
    
    namespaces[locale] = {};
    
    for (const namespace of Object.keys(translations[locale])) {
      const nsKeys = getAllKeys(translations[locale][namespace]);
      const totalKeys = nsKeys.length;
      
      let translatedKeys = 0;
      let emptyKeys = 0;
      
      for (const key of nsKeys) {
        const value = getValueByPath(translations[locale][namespace], key.split('.'));
        if (typeof value === 'string') {
          if (value.trim() === '') {
            emptyKeys++;
          } else {
            translatedKeys++;
          }
        }
      }
      
      namespaces[locale][namespace] = {
        total: totalKeys,
        translated: translatedKeys,
        empty: emptyKeys,
        completion: totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0
      };
    }
  }
  
  return namespaces;
}

function findMostCommonPrefixes(keys, minCount = 3) {
  const prefixes = {};
  
  for (const key of keys) {
    const parts = key.split('.');
    if (parts.length > 1) {
      const prefix = parts[0];
      prefixes[prefix] = (prefixes[prefix] || 0) + 1;
    }
  }
  
  return Object.entries(prefixes)
    .filter(([_, count]) => count >= minCount)
    .sort(([_, a], [__, b]) => b - a);
}

function analyzeTranslationQuality(translations) {
  const stats = {
    totalKeys: 0,
    duplicateValues: {},
    longTranslations: [],
    shortTranslations: [],
    parameterUsage: {
      withParams: 0,
      withoutParams: 0,
      commonParams: {}
    }
  };
  
  const sourceTranslations = translations[SOURCE_LOCALE];
  if (!sourceTranslations) return stats;
  
  const allKeys = getAllKeys(sourceTranslations);
  stats.totalKeys = allKeys.length;
  
  const valueToKeys = {};
  
  for (const key of allKeys) {
    const value = getValueByPath(sourceTranslations, key.split('.'));
    if (typeof value !== 'string') continue;
    
    // Track duplicate values
    if (valueToKeys[value]) {
      valueToKeys[value].push(key);
    } else {
      valueToKeys[value] = [key];
    }
    
    // Track long/short translations
    if (value.length > 100) {
      stats.longTranslations.push({ key, length: value.length, value: value.substring(0, 50) + '...' });
    } else if (value.length < 3) {
      stats.shortTranslations.push({ key, length: value.length, value });
    }
    
    // Track parameter usage
    const params = value.match(/{{\\s*\\w+\\s*}}/g) || [];
    if (params.length > 0) {
      stats.parameterUsage.withParams++;
      params.forEach(param => {
        const paramName = param.replace(/[{}\\s]/g, '');
        stats.parameterUsage.commonParams[paramName] = (stats.parameterUsage.commonParams[paramName] || 0) + 1;
      });
    } else {
      stats.parameterUsage.withoutParams++;
    }
  }
  
  // Find duplicates
  for (const [value, keys] of Object.entries(valueToKeys)) {
    if (keys.length > 1) {
      stats.duplicateValues[value] = keys;
    }
  }
  
  return stats;
}

function generateDetailedReport() {
  log('🌐 Translation Statistics Report', 'bold');
  log('===============================\\n', 'bold');
  
  // Load all translations
  const translations = {};
  for (const locale of SUPPORTED_LOCALES) {
    translations[locale] = loadTranslations(locale);
  }
  
  // Overall statistics
  log('📊 Overall Statistics:', 'cyan');
  for (const locale of SUPPORTED_LOCALES) {
    if (!translations[locale]) continue;
    
    const keys = getAllKeys(translations[locale]);
    const totalKeys = keys.length;
    
    let translatedKeys = 0;
    let emptyKeys = 0;
    
    for (const key of keys) {
      const value = getValueByPath(translations[locale], key.split('.'));
      if (typeof value === 'string') {
        if (value.trim() === '') {
          emptyKeys++;
        } else {
          translatedKeys++;
        }
      }
    }
    
    const completionRate = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;
    
    log(`  ${locale.toUpperCase()}: ${translatedKeys}/${totalKeys} keys (${completionRate}%)`, 'cyan');
    if (emptyKeys > 0) {
      log(`       ${emptyKeys} empty translations`, 'yellow');
    }
  }
  
  // Namespace breakdown
  log('\\n📁 Namespace Breakdown:', 'magenta');
  const namespaceStats = getNamespaceStats(translations);
  
  if (translations[SOURCE_LOCALE]) {
    const sourceNamespaces = Object.keys(translations[SOURCE_LOCALE]);
    
    for (const namespace of sourceNamespaces) {
      log(`\\n  📂 ${namespace}:`, 'magenta');
      
      for (const locale of SUPPORTED_LOCALES) {
        if (!namespaceStats[locale] || !namespaceStats[locale][namespace]) continue;
        
        const stats = namespaceStats[locale][namespace];
        log(`    ${locale.toUpperCase()}: ${stats.translated}/${stats.total} (${stats.completion}%)`, 'cyan');
        
        if (stats.empty > 0) {
          log(`         ${stats.empty} empty`, 'yellow');
        }
      }
    }
  }
  
  // Key analysis
  if (translations[SOURCE_LOCALE]) {
    const allKeys = getAllKeys(translations[SOURCE_LOCALE]);
    const commonPrefixes = findMostCommonPrefixes(allKeys);
    
    log('\\n🔑 Key Structure Analysis:', 'blue');
    log(`  Total translation keys: ${allKeys.length}`, 'blue');
    log(`  Average key depth: ${(allKeys.reduce((sum, key) => sum + key.split('.').length, 0) / allKeys.length).toFixed(2)}`, 'blue');
    
    if (commonPrefixes.length > 0) {
      log('\\n  Most common namespaces:', 'blue');
      commonPrefixes.slice(0, 10).forEach(([prefix, count]) => {
        log(`    ${prefix}: ${count} keys`, 'blue');
      });
    }
  }
  
  // Quality analysis
  log('\\n🎯 Translation Quality Analysis:', 'green');
  const qualityStats = analyzeTranslationQuality(translations);
  
  if (Object.keys(qualityStats.duplicateValues).length > 0) {
    log(`  ⚠️  Found ${Object.keys(qualityStats.duplicateValues).length} duplicate translations`, 'yellow');
    Object.entries(qualityStats.duplicateValues).slice(0, 5).forEach(([value, keys]) => {
      log(`    "${value}" appears in: ${keys.join(', ')}`, 'yellow');
    });
  }
  
  if (qualityStats.longTranslations.length > 0) {
    log(`  📏 ${qualityStats.longTranslations.length} long translations (>100 chars)`, 'cyan');
    qualityStats.longTranslations.slice(0, 3).forEach(({ key, length }) => {
      log(`    ${key} (${length} chars)`, 'cyan');
    });
  }
  
  if (qualityStats.shortTranslations.length > 0) {
    log(`  📏 ${qualityStats.shortTranslations.length} very short translations (<3 chars)`, 'cyan');
    qualityStats.shortTranslations.slice(0, 5).forEach(({ key, value }) => {
      log(`    ${key}: "${value}"`, 'cyan');
    });
  }
  
  // Parameter usage
  const totalTranslations = qualityStats.parameterUsage.withParams + qualityStats.parameterUsage.withoutParams;
  if (totalTranslations > 0) {
    const paramPercentage = Math.round((qualityStats.parameterUsage.withParams / totalTranslations) * 100);
    log(`\\n🔧 Parameter Usage:`, 'magenta');
    log(`  ${qualityStats.parameterUsage.withParams}/${totalTranslations} translations use parameters (${paramPercentage}%)`, 'magenta');
    
    if (Object.keys(qualityStats.parameterUsage.commonParams).length > 0) {
      log('  Most common parameters:', 'magenta');
      Object.entries(qualityStats.parameterUsage.commonParams)
        .sort(([_, a], [__, b]) => b - a)
        .slice(0, 5)
        .forEach(([param, count]) => {
          log(`    {{${param}}}: used ${count} times`, 'magenta');
        });
    }
  }
  
  log('\\n===============================', 'bold');
}

function main() {
  generateDetailedReport();
}

main();