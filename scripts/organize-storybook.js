#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Define the main categories
const categories = {
  atoms: ['Button', 'Heading', 'Icon', 'Input', 'Paragraph', 'RTLText', 'RTLList', 'RTLWrapper'],
  molecules: ['Card', 'Form', 'NavItem', 'TextField', 'LanguageSwitcher', 'DocumentCard'],
  organisms: ['Header', 'Footer', 'DocumentList', 'OwnerPortalSidebar', 'PropertyShowcase', 'DocumentUpload', 'DocumentPreview', 'Hero', 'AboutSection'],
  templates: ['PublicLandingTemplate', 'OwnerDashboardTemplate'],
  pages: ['HomePage', 'OwnerLoginPage', 'OwnerSignUpPage', 'VerifyRequestPage', 'OwnerDashboardPage', 'ContactPage', 'PropertyDetailPage', 'OwnerRegistrationsPage'],
  documentation: ['Introduction', 'I18nSystem', 'PermissionSystem', 'S3Integration', 'TranslationService', 'TranslationWorkflow', 'ErrorBoundary', 'AuthWrapper']
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

// Get all story files
const storyFiles = fs.readdirSync(storiesDir)
  .filter(file => file.endsWith('.stories.tsx') && !file.startsWith('.'));

// Move files to appropriate category folders
storyFiles.forEach(file => {
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

console.log('Storybook story organization complete!'); 