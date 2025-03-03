/**
 * Storybook Organization Utilities
 * 
 * This file provides constants and utilities for organizing 
 * Storybook stories according to Atomic Design principles.
 */

// Main categories based on Atomic Design
export const CATEGORY = {
  DOCUMENTATION: 'Documentation',
  DESIGN_SYSTEM: 'Design System',
  ATOMS: 'Atoms',
  MOLECULES: 'Molecules',
  ORGANISMS: 'Organisms',
  TEMPLATES: 'Templates',
  PAGES: 'Pages',
};

// Application-specific subcategories
export const SUBCATEGORY = {
  // Atoms
  BUTTON: 'Button',
  INPUT: 'Input',
  TEXT: 'Text',
  ICONS: 'Icons',
  RTL: 'RTL Components',
  
  // Molecules
  CARD: 'Card',
  FORM: 'Form',
  NAVIGATION: 'Navigation',
  
  // Organisms
  DOCUMENT_LIST: 'Document List',
  DOCUMENT_VIEWER: 'Document Viewer',
  DOCUMENT_UPLOAD: 'Document Upload',
  LAYOUT: 'Layout',
  FEATURE_SECTIONS: 'Feature Sections',
  
  // Templates
  PUBLIC_TEMPLATES: 'Public Site',
  OWNER_TEMPLATES: 'Owner Portal',
  
  // Pages
  PUBLIC_PAGES: 'Public Pages',
  OWNER_PAGES: 'Owner Pages',
  
  // Documentation
  GUIDES: 'Guides',
  INTEGRATION: 'Integration',
  WORKFLOWS: 'Workflows',
};

/**
 * Creates a properly formatted story title
 * 
 * @param category The main category (from CATEGORY)
 * @param subcategory Optional subcategory
 * @param component Component name
 * @returns Formatted story title string
 */
export function createStoryTitle(
  category: string,
  subcategory?: string,
  component?: string
): string {
  if (subcategory && component) {
    return `${category}/${subcategory}/${component}`;
  } else if (subcategory) {
    return `${category}/${subcategory}`;
  } else if (component) {
    return `${category}/${component}`;
  } else {
    return category;
  }
}

/**
 * Suggests a category based on component file path
 * 
 * @param filePath Path to the component
 * @returns Suggested category from CATEGORY
 */
export function suggestCategory(filePath: string): string {
  // Extract component name and path
  const paths = filePath.split('/');
  const componentName = paths[paths.length - 1].replace('.tsx', '');
  
  // Atomic components are typically in src/components
  if (filePath.includes('/atoms/')) {
    return CATEGORY.ATOMS;
  } else if (filePath.includes('/molecules/')) {
    return CATEGORY.MOLECULES;
  } else if (filePath.includes('/organisms/')) {
    return CATEGORY.ORGANISMS;
  } else if (filePath.includes('/templates/')) {
    return CATEGORY.TEMPLATES;
  } else if (filePath.includes('/pages/')) {
    return CATEGORY.PAGES;
  }
  
  // Components in app directory are likely Pages or Templates
  if (filePath.startsWith('app/')) {
    if (filePath.endsWith('page.tsx')) {
      return CATEGORY.PAGES;
    } else if (filePath.includes('layout.tsx')) {
      return CATEGORY.TEMPLATES;
    }
  }
  
  // Fallback to common components
  const atomicComponents = [
    'Button', 'Input', 'Icon', 'Text', 'Heading', 'Paragraph'
  ];
  
  const molecularComponents = [
    'Card', 'Form', 'NavItem', 'TextField', 'LanguageSwitcher'
  ];
  
  const organismComponents = [
    'Header', 'Footer', 'DocumentList', 'DocumentViewer', 'Hero'
  ];
  
  if (atomicComponents.some(c => componentName.includes(c))) {
    return CATEGORY.ATOMS;
  } else if (molecularComponents.some(c => componentName.includes(c))) {
    return CATEGORY.MOLECULES;
  } else if (organismComponents.some(c => componentName.includes(c))) {
    return CATEGORY.ORGANISMS;
  }
  
  // Default fallback
  return CATEGORY.MOLECULES;
} 