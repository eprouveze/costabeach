#!/usr/bin/env node

/**
 * Simple script to find hardcoded toast messages specifically
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

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

// Find all TypeScript/JavaScript files
const files = glob.sync('**/*.{tsx,ts,jsx,js}', {
  ignore: ['node_modules/**', '.next/**', 'dist/**', '**/*.test.*', '**/*.stories.*']
});

log('🍞 Toast Message Finder', 'bold');
log('========================\n', 'bold');
log(`🔍 Scanning ${files.length} files for hardcoded toast messages...`, 'blue');

const findings = [];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Look for toast calls with hardcoded strings
      const toastMatches = [
        /toast\.(error|success|info|warn|warning)\s*\(\s*["'`]([^"'`]+)["'`]/g,
        /toast\.(error|success|info|warn|warning)\s*\(\s*`([^`]*)`/g
      ];
      
      toastMatches.forEach(regex => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          const method = match[1];
          const message = match[2];
          
          // Skip if it's already using t() function
          if (line.includes('t(') && line.indexOf('t(') < match.index) {
            continue;
          }
          
          // Skip very short messages or technical ones
          if (message.length < 3 || message.match(/^[a-z_]+$/)) {
            continue;
          }
          
          findings.push({
            file,
            line: lineNumber,
            method,
            message,
            lineContent: line.trim(),
            fullMatch: match[0]
          });
        }
      });
      
      // Also look for alert, confirm, prompt
      const alertMatches = [
        /alert\s*\(\s*["'`]([^"'`]+)["'`]/g,
        /confirm\s*\(\s*["'`]([^"'`]+)["'`]/g,
        /prompt\s*\(\s*["'`]([^"'`]+)["'`]/g
      ];
      
      alertMatches.forEach(regex => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          const message = match[1];
          
          if (message.length < 3) continue;
          
          findings.push({
            file,
            line: lineNumber,
            method: 'alert/confirm/prompt',
            message,
            lineContent: line.trim(),
            fullMatch: match[0]
          });
        }
      });
    });
  } catch (error) {
    log(`Error reading ${file}: ${error.message}`, 'red');
  }
});

// Display results
log(`\n📊 Results:`, 'bold');
log(`Files scanned: ${files.length}`, 'cyan');
log(`Hardcoded toast messages found: ${findings.length}`, 'cyan');

if (findings.length === 0) {
  log('\n✅ No hardcoded toast messages found!', 'green');
} else {
  log('\n🚨 Hardcoded toast messages found:', 'yellow');
  
  findings.forEach((finding, index) => {
    log(`\n${index + 1}. 📄 ${finding.file}:${finding.line}`, 'magenta');
    log(`   🍞 toast.${finding.method}()`, 'blue');
    log(`   💬 "${finding.message}"`, 'yellow');
    log(`   📝 ${finding.lineContent}`, 'cyan');
  });
  
  log('\n💡 Suggested fixes:', 'blue');
  log('1. Add translation keys to your locale files (fr.json, en.json, ar.json)', 'blue');
  log('2. Import useI18n hook: import { useI18n } from "@/lib/i18n/client"', 'blue');
  log('3. Add const { t } = useI18n(); to your component', 'blue');
  log('4. Replace hardcoded strings with t("toast.category.key")', 'blue');
  log('5. Use interpolation for dynamic values: t("key", { variable })', 'blue');
}

log('\n========================', 'bold');

if (findings.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}