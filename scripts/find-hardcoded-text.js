#!/usr/bin/env node

/**
 * Hardcoded Text Detection Script
 * Finds strings that should probably be translated but aren't using the t() function
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SOURCE_PATTERNS = [
  'app/**/*.{tsx,ts,jsx,js}',
  'src/**/*.{tsx,ts,jsx,js}',
  '!**/*.test.{tsx,ts,jsx,js}',
  '!**/*.stories.{tsx,ts,jsx,js}',
  '!**/node_modules/**',
  '!**/.next/**',
  '!**/dist/**'
];

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

// Patterns to ignore (these are likely not user-facing text)
const IGNORE_PATTERNS = [
  /^[a-z_][a-zA-Z0-9_]*$/, // Variable names like userId, isLoading
  /^[A-Z_][A-Z0-9_]*$/, // Constants like API_URL, MAX_SIZE
  /^\d+(\.\d+)?$/, // Numbers only (including decimals)
  /^[\w-]+\.[\w-]+(\.\w+)*$/, // File extensions, domains, or API paths
  /^#[0-9a-fA-F]{3,6}$/, // Hex colors
  /^rgb\(/, // RGB colors
  /^rgba\(/, // RGBA colors
  /^hsl\(/, // HSL colors
  /^[\w-]+$/, // CSS classes, IDs, single words without spaces
  /^\.\//, // Relative paths
  /^\//, // Absolute paths and routes
  /^https?:\/\//, // URLs
  /^mailto:/, // Email links
  /^tel:/, // Phone links
  /^data:/, // Data URLs
  /^\w+\/\w+$/, // MIME types
  /^[a-z]+:[a-z-]+$/, // Namespace patterns like aria:label
  /^(use|on|is|has|should|can|will)[A-Z]/, // Hook/handler patterns
  /^\w+\s*\(/, // Function calls
  /^[\w-]+(\.[\w-]+)+$/, // Dot notation like object.property.method
];

// Common technical terms that are usually not translated
const TECHNICAL_TERMS = new Set([
  'localhost', 'API', 'URL', 'HTTP', 'HTTPS', 'JSON', 'XML', 'CSS', 'HTML',
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Prisma', 'OAuth',
  'admin', 'user', 'email', 'password', 'token', 'session', 'cookie',
  'database', 'table', 'column', 'index', 'query', 'migration',
  'component', 'props', 'state', 'hook', 'context', 'provider',
  'router', 'route', 'middleware', 'server', 'client', 'dev', 'prod',
  'build', 'deploy', 'test', 'debug', 'config', 'env', 'var',
  'id', 'uuid', 'guid', 'hash', 'auth', 'login', 'logout', 'signin', 'signup',
  'px', 'rem', 'em', 'vh', 'vw', 'auto', 'none', 'hidden', 'visible',
  'flex', 'grid', 'block', 'inline', 'absolute', 'relative', 'fixed'
]);

function shouldIgnoreString(str, context) {
  // Ignore empty or very short strings
  if (str.length < 2) return true;
  
  // Ignore strings that are already translated (using t() function)
  if (context.includes('t(')) return true;
  
  // Check for user-facing message patterns (these should NEVER be ignored)
  const isToastMessage = context.includes('toast.') || 
                        context.includes('alert(') ||
                        context.includes('confirm(') ||
                        context.includes('prompt(');
  
  const isPlaceholder = context.includes('placeholder') && context.includes('=');
  const isTitle = context.includes('title') && context.includes('=');
  const isAltText = context.includes('alt') && context.includes('=');
  const isAriaLabel = context.includes('aria-label') && context.includes('=');
  const isButtonText = context.includes('<button') || context.includes('Button');
  const isHeading = context.match(/<h[1-6][^>]*>/);
  const isJSXContent = context.match(/>\s*["'][^"']*["']\s*</);
  
  // If it's a user-facing message, don't ignore it
  if (isToastMessage || isPlaceholder || isTitle || isAltText || isAriaLabel || isButtonText || isHeading || isJSXContent) {
    // But still ignore if it's clearly technical
    if (TECHNICAL_TERMS.has(str.toLowerCase()) && str.length < 10) {
      return true;
    }
    return false;
  }
  
  // Ignore strings in comments
  if (context.includes('//') || context.includes('/*')) return true;
  
  // Ignore strings in console statements
  if (context.includes('console.')) return true;
  
  // Ignore strings in import/require statements
  if (context.includes('import') || context.includes('require(')) return true;
  
  // Ignore strings that match technical patterns
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(str)) return true;
  }
  
  // Ignore single technical terms
  if (TECHNICAL_TERMS.has(str.toLowerCase())) return true;
  
  // Ignore JSX prop values that are clearly technical
  if (context.match(/\\w+\\s*=\\s*["']/) && context.includes('=')) {
    // Check if it's a technical prop like className, onClick, etc.
    const propMatch = context.match(/(\\w+)\\s*=\\s*["'][^"']*["']/);
    if (propMatch) {
      const propName = propMatch[1];
      const technicalProps = ['className', 'id', 'key', 'ref', 'style', 'onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur', 'type', 'name', 'value', 'href', 'src', 'width', 'height'];
      if (technicalProps.includes(propName)) {
        return true;
      }
    }
  }
  
  return false;
}

function extractStringsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    // Find all string literals AND JSX element content
    const stringPattern = /(['"])((?:(?!\\1)[^\\\\]|\\\\.)*)\\1/g;
    const jsxContentPattern = />([^<>{}]+)</g;
    let match;
    
    // First, find quoted string literals
    while ((match = stringPattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const quote = match[1];
      const str = match[2];
      const startIndex = match.index;
      
      
      // Get context around the string (50 chars before and after)
      const contextStart = Math.max(0, startIndex - 50);
      const contextEnd = Math.min(content.length, startIndex + fullMatch.length + 50);
      const context = content.substring(contextStart, contextEnd);
      
      // Debug: log all toast-related strings found
      if (context.includes('toast.') && process.env.DEBUG_HARDCODED) {
        console.log(`DEBUG: Found toast-related string: "${str}" in context: ${context.substring(0, 100)}`);
      }
      
      
      // Skip if this string should be ignored
      if (shouldIgnoreString(str, context)) {
        // Debug: log some skipped toast messages
        if (context.includes('toast.') && process.env.DEBUG_HARDCODED) {
          console.log(`DEBUG: Skipped toast message: "${str}" in context: ${context.substring(0, 100)}`);
        }
        continue;
      }
      
      // Skip if string contains only whitespace
      if (str.trim().length === 0) continue;
      
      // Skip if string looks like it's already translated or is a translation key
      if (str.includes('.') && str.split('.').length > 1 && !str.includes(' ')) continue;
      
      // Skip if string is in an import statement
      if (context.includes('import') && context.includes('from')) continue;
      
      // Skip if string is a file path or module name
      if (str.startsWith('./') || str.startsWith('../') || str.startsWith('/')) continue;
      
      // Get line number
      const linesBeforeMatch = content.substring(0, startIndex).split('\\n');
      const lineNumber = linesBeforeMatch.length;
      const lineContent = content.split('\\n')[lineNumber - 1];
      
      // Check if this looks like user-facing text
      const hasSpaces = str.includes(' ');
      const hasUppercase = /[A-Z]/.test(str);
      const isToastMessage = context.includes('toast.');
      const isAlertMessage = context.includes('alert(') || context.includes('confirm(') || context.includes('prompt(');
      const isErrorMessage = context.includes('.error') || context.includes('.success') || context.includes('.warning') || context.includes('.info');
      const isPlaceholder = context.includes('placeholder') && context.includes('=');
      const isTitle = context.includes('title') && context.includes('=');
      const isAltText = context.includes('alt') && context.includes('=');
      const isAriaLabel = context.includes('aria-label') && context.includes('=');
      const isButtonText = context.includes('<button') || context.includes('Button');
      const isHeading = context.match(/<h[1-6][^>]*>/);
      const isJSXContent = context.match(/>\s*["'][^"']*["']\s*</);
      const isOptionValue = context.includes('<option') || context.includes('option');
      const isLabel = context.includes('<label') || context.includes('label');
      
      // More sophisticated detection of user-facing text
      const isUserFacing = 
        isToastMessage || isAlertMessage || isErrorMessage || 
        isPlaceholder || isTitle || isAltText || isAriaLabel || 
        isButtonText || isHeading || isJSXContent || isOptionValue || isLabel ||
        (hasSpaces && hasUppercase) || // Multi-word text with capitals (likely UI text)
        (str.length > 8 && hasUppercase && /[a-z]/.test(str)); // Longer mixed case strings
      
      if (isUserFacing) {
        // Determine the type of message for better reporting
        let messageType = 'text';
        if (isToastMessage) messageType = 'toast';
        else if (isAlertMessage) messageType = 'alert';
        else if (isErrorMessage) messageType = 'notification';
        else if (isPlaceholder) messageType = 'placeholder';
        else if (isTitle || isAltText || isAriaLabel) messageType = 'attribute';
        else if (isButtonText) messageType = 'button';
        else if (isHeading) messageType = 'heading';
        else if (isJSXContent) messageType = 'content';
        else if (isOptionValue || isLabel) messageType = 'form';
        
        findings.push({
          string: str,
          line: lineNumber,
          lineContent: lineContent.trim(),
          context: context.trim(),
          type: messageType
        });
      }
    }
    
    // Now, find JSX element content (text between tags)
    let jsxMatch;
    while ((jsxMatch = jsxContentPattern.exec(content)) !== null) {
      const fullMatch = jsxMatch[0];
      const str = jsxMatch[1].trim();
      const startIndex = jsxMatch.index;
      
      // Skip if empty or just whitespace
      if (str.length < 2 || /^\\s*$/.test(str)) continue;
      
      // Get context around the JSX content
      const contextStart = Math.max(0, startIndex - 50);
      const contextEnd = Math.min(content.length, startIndex + fullMatch.length + 50);
      const context = content.substring(contextStart, contextEnd);
      
      
      // Skip if this string should be ignored
      if (shouldIgnoreString(str, context)) {
        continue;
      }
      
      // Get line number
      const linesBeforeMatch = content.substring(0, startIndex).split('\\n');
      const lineNumber = linesBeforeMatch.length;
      const lineContent = content.split('\\n')[lineNumber - 1];
      
      // Check if this looks like user-facing JSX content
      const hasSpaces = str.includes(' ');
      const hasUppercase = /[A-Z]/.test(str);
      const isJSXContent = true; // by definition
      
      // More sophisticated detection of user-facing text
      const isUserFacing = 
        isJSXContent && (hasSpaces || (hasUppercase && str.length > 4));
      
      if (isUserFacing) {
        findings.push({
          string: str,
          line: lineNumber,
          lineContent: lineContent.trim(),
          context: context.trim(),
          type: 'content'
        });
      }
    }
    
    return findings;
  } catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`, 'red');
    return [];
  }
}

function analyzeFiles() {
  log('🔍 Scanning for hardcoded text...', 'blue');
  
  const allFiles = [];
  
  // Collect all files matching patterns
  for (const pattern of SOURCE_PATTERNS) {
    if (pattern.startsWith('!')) continue; // Skip exclude patterns for now
    
    const files = glob.sync(pattern, { 
      cwd: process.cwd(),
      ignore: SOURCE_PATTERNS.filter(p => p.startsWith('!')).map(p => p.substring(1))
    });
    
    allFiles.push(...files);
  }
  
  const uniqueFiles = [...new Set(allFiles)];
  log(`📁 Found ${uniqueFiles.length} files to analyze`, 'cyan');
  
  const allFindings = [];
  let filesWithIssues = 0;
  
  for (const file of uniqueFiles) {
    const findings = extractStringsFromFile(file);
    
    if (findings.length > 0) {
      allFindings.push({
        file,
        findings
      });
      filesWithIssues++;
    }
  }
  
  return { allFindings, filesWithIssues, totalFiles: uniqueFiles.length };
}

function displayResults(results) {
  const { allFindings, filesWithIssues, totalFiles } = results;
  
  log('\\n📊 Analysis Results:', 'bold');
  log(`Files scanned: ${totalFiles}`, 'cyan');
  log(`Files with potential issues: ${filesWithIssues}`, 'cyan');
  
  const totalFindings = allFindings.reduce((sum, f) => sum + f.findings.length, 0);
  log(`Total hardcoded strings found: ${totalFindings}`, 'cyan');
  
  // Count by type
  if (totalFindings > 0) {
    const typeCount = {};
    for (const fileResult of allFindings) {
      for (const finding of fileResult.findings) {
        typeCount[finding.type] = (typeCount[finding.type] || 0) + 1;
      }
    }
    
    log('\\nBreakdown by type:', 'cyan');
    for (const [type, count] of Object.entries(typeCount).sort((a, b) => b[1] - a[1])) {
      const typeEmojis = {
        'toast': '🍞',
        'alert': '⚠️',
        'notification': '🔔',
        'placeholder': '📝',
        'attribute': '🏷️',
        'button': '🔘',
        'heading': '📰',
        'content': '📄',
        'form': '📋',
        'text': '💬'
      };
      const emoji = typeEmojis[type] || '📝';
      log(`  ${emoji} ${type}: ${count}`, 'cyan');
    }
  }
  
  if (allFindings.length === 0) {
    log('\\n✅ No hardcoded text found!', 'green');
    return;
  }
  
  log('\\n🚨 Potential hardcoded text found:', 'yellow');
  
  for (const fileResult of allFindings) {
    log(`\\n📄 ${fileResult.file}:`, 'magenta');
    
    for (const finding of fileResult.findings) {
      const typeEmojis = {
        'toast': '🍞',
        'alert': '⚠️',
        'notification': '🔔',
        'placeholder': '📝',
        'attribute': '🏷️',
        'button': '🔘',
        'heading': '📰',
        'content': '📄',
        'form': '📋',
        'text': '💬'
      };
      const typeEmoji = typeEmojis[finding.type] || '📝';
      log(`  Line ${finding.line} [${typeEmoji} ${finding.type}]: "${finding.string}"`, 'yellow');
      log(`    Context: ${finding.lineContent}`, 'cyan');
    }
  }
  
  log('\\n💡 Suggestions:', 'blue');
  log('1. Replace hardcoded strings with translation keys using t("key")', 'blue');
  log('2. Add the corresponding translations to your locale files', 'blue');
  log('3. Consider if any of these strings are actually technical and can be ignored', 'blue');
}

function main() {
  log('🌐 Hardcoded Text Detection Tool', 'bold');
  log('================================\\n', 'bold');
  
  const results = analyzeFiles();
  displayResults(results);
  
  log('\\n================================', 'bold');
  
  if (results.filesWithIssues > 0) {
    log('⚠️  Consider translating the strings found above', 'yellow');
    process.exit(1);
  } else {
    log('✅ No hardcoded text detected!', 'green');
    process.exit(0);
  }
}

// Check if glob is available, if not suggest installation
try {
  require('glob');
} catch (error) {
  log('❌ This script requires the "glob" package.', 'red');
  log('Install it with: npm install --save-dev glob', 'yellow');
  process.exit(1);
}

main();