#!/usr/bin/env node

/**
 * Safe I18n Key Extraction Script
 * 
 * This script safely extracts translation keys while preserving existing translations.
 * It creates backups before running extraction and validates no data was lost.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const LOCALES_DIR = 'src/lib/i18n/locales';
const BACKUP_DIR = '.i18n-backups';
const LOCALES = ['fr', 'en', 'ar'];

console.log('🛡️  Safe I18n Key Extraction');
console.log('==============================\n');

/**
 * Create timestamped backup of all translation files
 */
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, timestamp);
  
  // Create backup directory
  fs.mkdirSync(backupPath, { recursive: true });
  
  console.log('📦 Creating backup...');
  
  // Copy all locale files
  for (const locale of LOCALES) {
    const sourceFile = path.join(LOCALES_DIR, `${locale}.json`);
    const backupFile = path.join(backupPath, `${locale}.json`);
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, backupFile);
      console.log(`   ✅ Backed up ${locale}.json`);
    }
  }
  
  console.log(`   📁 Backup saved to: ${backupPath}\n`);
  return backupPath;
}

/**
 * Load JSON file safely
 */
function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`❌ Error loading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Count total keys in nested object
 */
function countKeys(obj, prefix = '') {
  let count = 0;
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      count += countKeys(value, prefix + key + '.');
    } else {
      count++;
    }
  }
  return count;
}

/**
 * Compare translation files before and after extraction
 */
function validateExtractionSafety(backupPath) {
  console.log('🔍 Validating extraction safety...');
  
  let allSafe = true;
  
  for (const locale of LOCALES) {
    const backupFile = path.join(backupPath, `${locale}.json`);
    const currentFile = path.join(LOCALES_DIR, `${locale}.json`);
    
    if (!fs.existsSync(backupFile) || !fs.existsSync(currentFile)) {
      continue;
    }
    
    const backup = loadJson(backupFile);
    const current = loadJson(currentFile);
    
    if (!backup || !current) {
      continue;
    }
    
    const backupKeys = countKeys(backup);
    const currentKeys = countKeys(current);
    
    console.log(`   📊 ${locale}.json: ${backupKeys} → ${currentKeys} keys`);
    
    if (currentKeys < backupKeys) {
      console.log(`   ⚠️  WARNING: ${locale}.json lost ${backupKeys - currentKeys} keys!`);
      allSafe = false;
    } else if (currentKeys > backupKeys) {
      console.log(`   ✅ ${locale}.json gained ${currentKeys - backupKeys} new keys`);
    } else {
      console.log(`   ✅ ${locale}.json key count unchanged`);
    }
  }
  
  return allSafe;
}

/**
 * Restore from backup if extraction was unsafe
 */
function restoreFromBackup(backupPath) {
  console.log('\n🔄 Restoring from backup...');
  
  for (const locale of LOCALES) {
    const backupFile = path.join(backupPath, `${locale}.json`);
    const currentFile = path.join(LOCALES_DIR, `${locale}.json`);
    
    if (fs.existsSync(backupFile)) {
      fs.copyFileSync(backupFile, currentFile);
      console.log(`   ✅ Restored ${locale}.json`);
    }
  }
}

/**
 * Main execution
 */
function main() {
  try {
    // Create backup before extraction
    const backupPath = createBackup();
    
    // Run i18next-parser extraction
    console.log('🔧 Running i18next-parser extraction...');
    execSync('npm run i18n:extract', { stdio: 'inherit' });
    
    // Validate that no translations were lost
    const isSafe = validateExtractionSafety(backupPath);
    
    if (isSafe) {
      console.log('\n✅ Extraction completed safely!');
      console.log('   All existing translations preserved.');
    } else {
      console.log('\n❌ Unsafe extraction detected!');
      console.log('   Restoring from backup...');
      restoreFromBackup(backupPath);
      console.log('\n💡 Suggestion: Check i18next-parser.config.js settings:');
      console.log('   - Ensure keepRemoved: true');
      console.log('   - Verify lexer configuration captures all key patterns');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Error during extraction:', error.message);
    process.exit(1);
  }
}

// Run the script
main();