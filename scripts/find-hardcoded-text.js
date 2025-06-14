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
  /^[a-z_][a-zA-Z0-9_]*$/, // Variable names
  /^[A-Z_][A-Z0-9_]*$/, // Constants
  /^\d+$/, // Numbers only
  /^[\w-]+\.[\w-]+$/, // File extensions or domains
  /^#[0-9a-fA-F]{3,6}$/, // Hex colors
  /^rgb\(/, // RGB colors
  /^rgba\(/, // RGBA colors
  /^\$$/, // Single character
  /^[a-z]+:[a-z]+$/, // Namespace patterns
  /^[a-z-]+$/, // CSS class patterns (single words with dashes)
  /^\.\//, // Relative paths
  /^\//, // Absolute paths
  /^https?:\/\//, // URLs
  /^mailto:/, // Email links
  /^tel:/, // Phone links
  /^data:/, // Data URLs
  /^\w+\/\w+$/, // MIME types
  /console\.(log|warn|error|debug)/, // Console statements
  /^[\w-]+$/, // Single words (might be IDs, class names, etc.)
  /^\w+\s*\(/, // Function calls
  /useState|useEffect|useCallback|useMemo/, // React hooks
  /className|onClick|onChange|onSubmit/, // React props
];

// Common technical terms that are usually not translated
const TECHNICAL_TERMS = new Set([
  'localhost', 'API', 'URL', 'HTTP', 'HTTPS', 'JSON', 'XML', 'CSS', 'HTML',
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Prisma', 'OAuth',
  'admin', 'user', 'email', 'password', 'token', 'session', 'cookie',
  'database', 'table', 'column', 'index', 'query', 'migration',
  'component', 'props', 'state', 'hook', 'context', 'provider',
  'router', 'route', 'middleware', 'server', 'client', 'dev', 'prod',
  'build', 'deploy', 'test', 'debug', 'config', 'env', 'var'
]);

function shouldIgnoreString(str, context) {
  // Ignore empty or very short strings
  if (str.length < 3) return true;
  
  // Ignore strings that match common patterns
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(str)) return true;
  }
  
  // Ignore technical terms
  if (TECHNICAL_TERMS.has(str.toLowerCase())) return true;
  
  // Ignore strings that are already inside t() function calls
  if (context.includes('t(')) return true;
  
  // Ignore strings in console statements
  if (context.includes('console.')) return true;
  
  // Ignore strings in comments
  if (context.includes('//') || context.includes('/*')) return true;
  
  // Ignore strings that look like JSX attributes
  if (context.match(/\\w+\\s*=\\s*["']/) && context.includes('=')) return true;
  
  return false;
}

function extractStringsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    // Find all string literals
    const stringPattern = /(['"])((?:(?!\\1)[^\\\\]|\\\\.)*)\\1/g;
    let match;
    
    while ((match = stringPattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const quote = match[1];
      const str = match[2];
      const startIndex = match.index;
      
      // Get context around the string (50 chars before and after)
      const contextStart = Math.max(0, startIndex - 50);
      const contextEnd = Math.min(content.length, startIndex + fullMatch.length + 50);
      const context = content.substring(contextStart, contextEnd);
      
      // Skip if this string should be ignored
      if (shouldIgnoreString(str, context)) continue;
      
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
      const isUserFacing = hasSpaces || (hasUppercase && str.length > 5);
      
      if (isUserFacing) {
        findings.push({
          string: str,
          line: lineNumber,
          lineContent: lineContent.trim(),
          context: context.trim()
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
  log(`Total hardcoded strings found: ${allFindings.reduce((sum, f) => sum + f.findings.length, 0)}`, 'cyan');
  
  if (allFindings.length === 0) {
    log('\\n✅ No hardcoded text found!', 'green');
    return;
  }
  
  log('\\n🚨 Potential hardcoded text found:', 'yellow');
  
  for (const fileResult of allFindings) {
    log(`\\n📄 ${fileResult.file}:`, 'magenta');
    
    for (const finding of fileResult.findings) {
      log(`  Line ${finding.line}: "${finding.string}"`, 'yellow');
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