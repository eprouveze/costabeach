#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the main categories
const categories = {
  atoms: ['Button', 'Heading', 'Icon', 'Input', 'Paragraph', 'RTLText', 'RTLList', 'RTLWrapper'],
  molecules: ['Card', 'Form', 'NavItem', 'TextField', 'LanguageSwitcher', 'DocumentCard'],
  organisms: ['Header', 'Footer', 'DocumentList', 'OwnerPortalSidebar', 'DocumentUpload', 'DocumentPreview', 'Hero', 'AboutSection'],
  templates: ['PublicLandingTemplate', 'OwnerDashboardTemplate'],
  pages: ['HomePage', 'OwnerLoginPage', 'OwnerSignUpPage', 'VerifyRequestPage', 'OwnerDashboardPage', 'ContactPage', 'OwnerRegistrationsPage'],
  documentation: ['Introduction', 'I18nSystem', 'PermissionSystem', 'S3Integration', 'TranslationService', 'TranslationWorkflow', 'ErrorBoundary', 'AuthWrapper', 'DocumentViewer', 'RTLComponents', 'Navigation', 'ContactForm'],
};

// Define proper title mapping with capitalized category names
const categoryTitles = {
  atoms: 'Atoms',
  molecules: 'Molecules', 
  organisms: 'Organisms',
  templates: 'Templates',
  pages: 'Pages',
  documentation: 'Documentation'
};

// Stories directory
const storiesDir = path.join(__dirname, '../src/stories');

// Ensure all category directories exist
Object.keys(categories).forEach(category => {
  const categoryDir = path.join(storiesDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
    console.log(`Created directory: ${categoryDir}`);
  }
});

// Process all story files in the main directory
const mainStoryFiles = fs.readdirSync(storiesDir)
  .filter(file => file.endsWith('.stories.tsx') && !file.startsWith('.'));

// Move files to appropriate category folders
mainStoryFiles.forEach(file => {
  const componentName = file.replace('.stories.tsx', '');
  let targetCategory = null;
  
  // Find which category the component belongs to
  for (const [category, components] of Object.entries(categories)) {
    if (components.includes(componentName)) {
      targetCategory = category;
      break;
    }
  }
  
  if (targetCategory) {
    const sourcePath = path.join(storiesDir, file);
    const targetPath = path.join(storiesDir, targetCategory, file);
    
    // Only move if the file doesn't already exist in the target directory
    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
      fs.unlinkSync(sourcePath);
      console.log(`Moved ${file} to ${targetCategory}/`);
    } else {
      console.log(`File already exists in target directory: ${targetPath}`);
    }
  } else {
    console.log(`Could not determine category for: ${file}`);
  }
});

// Function to find and update the title in a story file
function updateStoryTitle(filePath, category, componentName) {
  let content = fs.readFileSync(filePath, 'utf8');
  const expectedTitle = `${categoryTitles[category]}/${componentName}`;
  
  // Look for the meta object definition
  const metaMatch = content.match(/(?:const|let|var)\s+meta(?:\s*:\s*Meta(?:<[^>]+>)?)?(?:\s*=\s*)({[\s\S]*?title\s*:\s*['"][^'"]+['"][\s\S]*?})/);
  
  if (metaMatch) {
    const metaObject = metaMatch[1];
    const titleMatch = metaObject.match(/title\s*:\s*(['"])([^'"]+)\1/);
    
    if (titleMatch) {
      const currentTitle = titleMatch[2];
      
      if (currentTitle !== expectedTitle) {
        // Replace the title in the meta object
        const updatedMeta = metaObject.replace(
          /title\s*:\s*(['"])([^'"]+)\1/, 
          `title: $1${expectedTitle}$1`
        );
        
        // Replace the entire meta object in the content
        content = content.replace(metaMatch[0], metaMatch[0].replace(metaObject, updatedMeta));
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content);
        return true;
      }
    }
  }
  
  return false;
}

// Now update all story titles in each category directory
Object.keys(categories).forEach(category => {
  const categoryDir = path.join(storiesDir, category);
  
  if (fs.existsSync(categoryDir)) {
    const categoryFiles = fs.readdirSync(categoryDir)
      .filter(file => file.endsWith('.stories.tsx'));
      
    categoryFiles.forEach(file => {
      const filePath = path.join(categoryDir, file);
      const componentName = file.replace('.stories.tsx', '');
      
      if (updateStoryTitle(filePath, category, componentName)) {
        console.log(`Updated title for ${category}/${file}`);
      }
    });
  }
});

console.log('Storybook story organization complete! All titles updated to Atomic Design format.'); 