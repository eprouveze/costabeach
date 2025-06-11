#!/usr/bin/env node

/**
 * This script analyzes Storybook story files to ensure they have proper mock dependencies
 * for tRPC, i18n, and other context providers that may be required.
 * 
 * It also checks that stories follow the proper Atomic Design title pattern.
 * 
 * Usage: node scripts/fix-storybook-dependencies.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for stories
const STORIES_DIR = path.resolve(__dirname, '../src/stories');

// Atomic Design categories
const CATEGORIES = {
  atoms: 'Atoms',
  molecules: 'Molecules',
  organisms: 'Organisms',
  templates: 'Templates',
  pages: 'Pages',
  documentation: 'Documentation'
};

// Dependency patterns to check for
const DEPENDENCIES = {
  tRPC: {
    importPattern: /import.*from ['"]@\/lib\/trpc/,
    hookPattern: /useQuery|useMutation|useInfiniteQuery|useContext/,
    mockImport: "import MockTRPCProvider from '../../../.storybook/MockTRPCProvider';",
    decoratorCode: `
  decorators: [
    (Story) => (
      <MockTRPCProvider>
        <Story />
      </MockTRPCProvider>
    ),
  ],`
  },
  i18n: {
    importPattern: /import.*from ['"]@\/lib\/i18n/,
    hookPattern: /useI18n|useTranslation/,
    mockImport: "import { I18nProvider } from '@/lib/i18n/client';",
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

// Function to check if a story file follows the Atomic Design title pattern
function checkAtomicDesignTitle(filePath, content) {
  // Extract the component name from the filename
  const componentName = path.basename(filePath).replace('.stories.tsx', '');
  
  // Determine the expected category based on the directory
  const categoryDir = path.basename(path.dirname(filePath));
  const expectedCategory = CATEGORIES[categoryDir];
  
  if (!expectedCategory) {
    // Story is in the root directory or a non-standard directory
    return {
      hasCorrectTitle: false,
      expectedTitle: `Unknown/${componentName}`,
      actualTitle: getTitleFromContent(content)
    };
  }
  
  // Extract the actual title from the content
  const actualTitle = getTitleFromContent(content);
  const expectedTitle = `${expectedCategory}/${componentName}`;
  
  // Debug
  console.log(`Checking ${filePath}`);
  console.log(`  Expected title: "${expectedTitle}"`);
  console.log(`  Actual title: "${actualTitle}"`);
  console.log(`  Content title match: ${content.match(/title:\s*["']([^"']+)["']/)?.[0] || 'No match found'}`);
  
  return {
    hasCorrectTitle: actualTitle === expectedTitle,
    expectedTitle,
    actualTitle
  };
}

// Extract the title from the content
function getTitleFromContent(content) {
  // Try to find the title in the meta object (more specific)
  const metaMatch = content.match(/(?:const|let|var)\s+meta(?:\s*:\s*Meta(?:<[^>]+>)?)?(?:\s*=\s*)({[\s\S]*?title\s*:\s*["']([^"']+)["'][\s\S]*?})/);
  if (metaMatch) {
    return metaMatch[2];
  }
  
  // Try another pattern for meta object
  const metaMatch2 = content.match(/(?:const|let|var)\s+meta.*?\btitle\s*:\s*["']([^"']+)["']/s);
  if (metaMatch2) {
    return metaMatch2[1];
  }
  
  // Fallback to the general title match
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
  return titleMatch ? titleMatch[1] : 'Unknown';
}

// Function to recursively find story files
function findStoryFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.stories.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
  
  return files;
}

// Get all story files
const storyFiles = findStoryFiles(STORIES_DIR);

console.log(`Found ${storyFiles.length} story files to analyze`);

let titleIssuesFound = 0;
let dependencyIssuesFound = 0;

storyFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(process.cwd(), file);
  
  let fileHasIssues = false;
  let fileLog = [];
  
  // Check Atomic Design title
  const { hasCorrectTitle, expectedTitle, actualTitle } = checkAtomicDesignTitle(file, content);
  
  if (!hasCorrectTitle) {
    if (!fileHasIssues) {
      fileLog.push(`\n\x1b[1m${relativePath}\x1b[0m`);
      fileHasIssues = true;
    }
    
    fileLog.push(`  - Incorrect title: "${actualTitle}" should be "${expectedTitle}"`);
    titleIssuesFound++;
  }
  
  // Check dependencies
  Object.entries(DEPENDENCIES).forEach(([name, { importPattern, hookPattern, mockImport, decoratorCode }]) => {
    // Check if the file uses the dependency
    const usesDependency = importPattern.test(content) || hookPattern.test(content);
    // Check if the file contains a component import that might use this dependency
    const containsComponent = name === 'i18n' && (
      /import.*Header|LanguageSwitcher|OwnerPortalSidebar/.test(content) ||
      /import.*from ['"]@\/components\/(organisms|templates)/.test(content)
    );
    
    if (usesDependency || containsComponent) {
      // Check if the file already has the mock import
      const hasMockImport = content.includes(mockImport.split(' ')[1]); // Check for the specific import part
      
      // Check if the file has the decorator
      const hasDecorator = content.includes('decorators:') && 
                          (content.includes(mockImport.split(' ')[1].replace(/['";]/g, '')) ||
                           (name === 'i18n' && content.includes('I18nProvider')));
      
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
        
        dependencyIssuesFound++;
      }
    }
  });
  
  if (fileHasIssues) {
    console.log(fileLog.join('\n'));
  }
});

if (titleIssuesFound > 0) {
  console.log(`\nFound ${titleIssuesFound} title issues in Storybook stories.`);
  console.log('Please fix these issues by running the organize-storybook.js script:');
  console.log('  npm run organize-storybook');
}

if (dependencyIssuesFound > 0) {
  console.log(`\nFound ${dependencyIssuesFound} dependency issues in Storybook stories.`);
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
  
  console.log('\nExample fix for i18n dependency:');
  console.log('  1. Import the provider: import { I18nProvider } from "@/lib/i18n/client";');
  console.log('  2. Add the decorator to the meta:');
  console.log('     decorators: [');
  console.log('       (Story) => (');
  console.log('         <I18nProvider>');
  console.log('           <Story />');
  console.log('         </I18nProvider>');
  console.log('       ),');
  console.log('     ],');
} 

if (titleIssuesFound === 0 && dependencyIssuesFound === 0) {
  console.log('No issues found in Storybook stories! All dependencies are properly mocked and titles follow Atomic Design patterns.');
}

console.log('\nDone analyzing Storybook stories.'); 