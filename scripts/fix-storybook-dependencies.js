#!/usr/bin/env node

/**
 * This script analyzes Storybook story files to ensure they have proper mock dependencies
 * for tRPC, i18n, and other context providers that may be required.
 * 
 * Usage: node scripts/fix-storybook-dependencies.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Base directory for stories
const STORIES_DIR = path.resolve(__dirname, '../src/stories');

// Dependency patterns to check for
const DEPENDENCIES = {
  tRPC: {
    importPattern: /import.*from ['"]@\/lib\/trpc/,
    hookPattern: /useQuery|useMutation|useInfiniteQuery|useContext/,
    mockImport: "import { TRPCProvider } from '../../../.storybook/mockTrpc';",
    decoratorCode: `
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    ),
  ],`
  },
  i18n: {
    importPattern: /import.*from ['"]@\/lib\/i18n/,
    hookPattern: /useI18n|useTranslation/,
    mockImport: "import { I18nProvider } from '../../../.storybook/mockI18n';",
    decoratorCode: `
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],`
  },
  nextAuth: {
    importPattern: /import.*from ['"]next-auth/,
    hookPattern: /useSession|getSession|getCsrfToken/,
    mockImport: "import { SessionProvider } from '../../../.storybook/mockNextAuth';",
    decoratorCode: `
  decorators: [
    (Story) => (
      <SessionProvider>
        <Story />
      </SessionProvider>
    ),
  ],`
  }
};

// Get all story files
const storyFiles = glob.sync(path.join(STORIES_DIR, '**/*.stories.tsx'));

console.log(`Found ${storyFiles.length} story files to analyze`);

let issuesFound = 0;

storyFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(process.cwd(), file);
  
  let fileHasIssues = false;
  let fileLog = [];
  
  Object.entries(DEPENDENCIES).forEach(([name, { importPattern, hookPattern, mockImport, decoratorCode }]) => {
    // Check if the file uses the dependency
    const usesDependency = importPattern.test(content) || hookPattern.test(content);
    
    if (!usesDependency) return;
    
    // Check if the file already has the mock import
    const hasMockImport = content.includes(mockImport.split(' ')[1]); // Check for the specific import part
    
    // Check if the file has the decorator
    const hasDecorator = content.includes('decorators:') && 
                        content.includes(mockImport.split(' ')[1].replace(/['";]/g, ''));
    
    if (!hasMockImport || !hasDecorator) {
      if (!fileHasIssues) {
        fileLog.push(`\n\x1b[1m${relativePath}\x1b[0m`);
        fileHasIssues = true;
      }
      
      if (!hasMockImport) {
        fileLog.push(`  - Missing ${name} mock import`);
      }
      
      if (!hasDecorator) {
        fileLog.push(`  - Missing ${name} decorator`);
      }
      
      issuesFound++;
    }
  });
  
  if (fileHasIssues) {
    console.log(fileLog.join('\n'));
  }
});

if (issuesFound > 0) {
  console.log(`\nFound ${issuesFound} issues in Storybook stories.`);
  console.log('Please fix these issues by adding the appropriate mock imports and decorators.');
  console.log('Example fix for tRPC dependency:');
  console.log('  1. Import the mock: import { TRPCProvider } from "../../../.storybook/mockTrpc";');
  console.log('  2. Add the decorator to the meta:');
  console.log('     decorators: [');
  console.log('       (Story) => (');
  console.log('         <TRPCProvider>');
  console.log('           <Story />');
  console.log('         </TRPCProvider>');
  console.log('       ),');
  console.log('     ],');
} else {
  console.log('No issues found in Storybook stories! All dependencies are properly mocked.');
}

console.log('\nDone analyzing Storybook stories.'); 