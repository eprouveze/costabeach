# Enhanced Testing Setup

## 🎯 Overview

Phase 0 focuses on enhancing the existing excellent testing infrastructure to support AI features, external integrations, and comprehensive E2E testing. This builds upon the solid foundation of Jest + Testing Library + Storybook.

## 🏗️ Current Testing Infrastructure Analysis

### Existing Strengths ✅
```typescript
// From jest.setup.js (112 lines of sophisticated mocking)
- Comprehensive Supabase client mocking
- Multiple mock data items for consistent testing
- Authentication flow mocking
- Console error suppression for cleaner test output
- Environment variable setup for tests

// From jest.config.cjs (30 lines of optimized configuration)
- TypeScript support with ts-jest
- ESM module handling
- Transform ignore patterns for node_modules
- Module name mapping (@/... aliases)
- Proper test environment setup

// From Storybook setup
- Atomic design organization (Documentation → Atoms → Pages)
- Provider decorators with StoryProviders
- Multiple viewport testing
- Background theme testing
- Next.js App Router support
```

### Enhancement Goals 🚀
1. **AI Testing Framework**: Deterministic mocking for OpenAI/DeepL
2. **E2E Testing**: Playwright setup with critical user journeys
3. **Performance Testing**: Load testing for 300+ concurrent users
4. **Visual Regression**: Automated UI consistency checks
5. **Security Testing**: Enhanced RLS and permission validation

## 🤖 AI Testing Framework

### OpenAI Mock Enhancement

**Create**: `jest.setup.ai.js`
```javascript
// Enhanced AI mocking for consistent test behavior
import { jest } from '@jest/globals';

// Mock OpenAI with deterministic responses
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockImplementation(async ({ messages, temperature = 0.7 }) => {
          // Deterministic responses based on input patterns
          const lastMessage = messages[messages.length - 1];
          const content = lastMessage.content.toLowerCase();
          
          if (content.includes('translate')) {
            return {
              choices: [{
                message: {
                  content: JSON.stringify({
                    translated_text: 'Mock translated content',
                    source_language: 'en',
                    target_language: 'fr',
                    confidence: 0.95
                  })
                }
              }]
            };
          }
          
          if (content.includes('summarize')) {
            return {
              choices: [{
                message: {
                  content: JSON.stringify({
                    summary: 'Mock document summary',
                    key_points: ['Point 1', 'Point 2'],
                    word_count: 150
                  })
                }
              }]
            };
          }
          
          if (content.includes('question')) {
            return {
              choices: [{
                message: {
                  content: 'Mock Q&A response based on document context'
                }
              }]
            };
          }
          
          return {
            choices: [{
              message: { content: 'Mock AI response' }
            }]
          };
        }),
      },
    },
    embeddings: {
      create: jest.fn().mockImplementation(async ({ input }) => {
        // Generate deterministic embeddings for testing
        return {
          data: [{
            embedding: Array(1536).fill(0).map((_, i) => 
              Math.sin(i * 0.1 + input.length * 0.01)
            ),
            index: 0
          }]
        };
      }),
    },
  })),
}));

// Mock DeepL API
jest.mock('deepl-node', () => ({
  Translator: jest.fn().mockImplementation(() => ({
    translateText: jest.fn().mockImplementation(async (text, sourceLanguage, targetLanguage) => {
      // Simulate translation delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        text: `[DeepL Mock] Translated: ${text}`,
        detectedSourceLang: sourceLanguage || 'en',
        targetLang: targetLanguage,
      };
    }),
    getUsage: jest.fn().mockResolvedValue({
      character: { count: 1000, limit: 500000 },
      document: { count: 5, limit: 100 }
    }),
  })),
}));

// Export utilities for test files
export const createMockAIResponse = (type, content) => {
  switch (type) {
    case 'translation':
      return {
        translated_text: content || 'Mock translation',
        source_language: 'en',
        target_language: 'fr',
        confidence: 0.95
      };
    case 'summary':
      return {
        summary: content || 'Mock summary',
        key_points: ['Key point 1', 'Key point 2'],
        word_count: 150
      };
    case 'qa':
      return {
        answer: content || 'Mock Q&A answer',
        sources: ['Document 1', 'Document 2'],
        confidence: 0.88
      };
    default:
      return { content: content || 'Mock AI response' };
  }
};

export const mockAIError = (errorType = 'rate_limit') => {
  const errors = {
    rate_limit: new Error('Rate limit exceeded'),
    invalid_request: new Error('Invalid request format'),
    service_unavailable: new Error('Service temporarily unavailable'),
  };
  return errors[errorType] || new Error('Unknown AI service error');
};
```

### AI Test Utilities

**Create**: `src/lib/test-utils/ai-mocks.ts`
```typescript
import { createMockAIResponse, mockAIError } from '../../jest.setup.ai.js';

// Translation testing utilities
export const mockTranslationWorkflow = {
  success: (sourceText: string, targetLang: string) => ({
    jobId: 'mock-job-123',
    status: 'completed' as const,
    result: createMockAIResponse('translation', `Translated: ${sourceText}`),
    sourceLanguage: 'en',
    targetLanguage: targetLang,
    createdAt: new Date(),
    completedAt: new Date(),
  }),
  
  pending: (jobId: string) => ({
    jobId,
    status: 'pending' as const,
    estimatedCompletion: new Date(Date.now() + 300000), // 5 minutes
    progress: 0.3,
    createdAt: new Date(),
  }),
  
  error: (errorType?: string) => ({
    jobId: 'mock-job-error',
    status: 'failed' as const,
    error: mockAIError(errorType),
    createdAt: new Date(),
    failedAt: new Date(),
  }),
};

// Summary testing utilities
export const mockSummaryGeneration = {
  success: (documentContent: string) => ({
    summary: `Mock summary of document content: ${documentContent.substring(0, 50)}...`,
    keyPoints: [
      'Important point extracted from document',
      'Another relevant detail',
      'Conclusion or recommendation'
    ],
    wordCount: 150,
    readingTime: 2,
    confidence: 0.92,
  }),
  
  multiLanguage: (content: string, languages: string[]) => 
    languages.reduce((acc, lang) => ({
      ...acc,
      [lang]: {
        summary: `Mock ${lang} summary: ${content.substring(0, 30)}...`,
        keyPoints: [`${lang} point 1`, `${lang} point 2`],
        wordCount: 120,
      }
    }), {}),
};

// Q&A testing utilities
export const mockQAInteraction = {
  success: (question: string, context: string[]) => ({
    answer: `Mock answer to: ${question}`,
    sources: context.slice(0, 3),
    confidence: 0.88,
    responseTime: 2.5,
    usage: {
      tokensUsed: 450,
      cost: 0.001
    }
  }),
  
  noContext: (question: string) => ({
    answer: 'I don\'t have enough information to answer that question.',
    sources: [],
    confidence: 0.1,
    suggestion: 'Try asking about documents you have access to.',
  }),
  
  conversation: (messages: Array<{role: string, content: string}>) => ({
    answer: `Mock response considering ${messages.length} previous messages`,
    contextUsed: messages.slice(-3),
    confidence: 0.85,
  }),
};
```

## 🎭 Playwright E2E Testing Setup

### Installation and Configuration

**Install Playwright**:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Create**: `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile browsers (for RTL and responsive testing)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Utilities

**Create**: `__tests__/e2e/utils/test-helpers.ts`
```typescript
import { Page, expect } from '@playwright/test';

// Authentication helpers
export async function loginAsOwner(page: Page) {
  await page.goto('/auth/signin');
  await page.getByTestId('email-input').fill('owner@example.com');
  await page.getByTestId('password-input').fill('password123');
  await page.getByTestId('signin-button').click();
  await expect(page.getByTestId('dashboard')).toBeVisible();
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/auth/signin');
  await page.getByTestId('email-input').fill('admin@example.com');
  await page.getByTestId('password-input').fill('adminpass123');
  await page.getByTestId('signin-button').click();
  await expect(page.getByTestId('admin-dashboard')).toBeVisible();
}

// Document management helpers
export async function uploadDocument(page: Page, filePath: string, title?: string) {
  await page.getByTestId('upload-button').click();
  await page.setInputFiles('[data-testid="file-input"]', filePath);
  
  if (title) {
    await page.getByTestId('document-title').fill(title);
  }
  
  await page.getByTestId('upload-submit').click();
  await expect(page.getByText(/uploaded successfully/i)).toBeVisible();
}

// Language switching helpers
export async function switchLanguage(page: Page, language: 'en' | 'fr' | 'ar') {
  await page.getByTestId('language-switcher').click();
  await page.getByTestId(`language-${language}`).click();
  
  // Verify URL contains language prefix
  await expect(page).toHaveURL(new RegExp(`/${language}/`));
}

// RTL testing helpers
export async function verifyRTLLayout(page: Page) {
  await switchLanguage(page, 'ar');
  
  // Check that main content has RTL direction
  const content = page.getByTestId('main-content');
  await expect(content).toHaveCSS('direction', 'rtl');
  
  // Verify navigation elements are mirrored
  const nav = page.getByTestId('navigation');
  await expect(nav).toHaveCSS('direction', 'rtl');
}

// Performance testing helpers
export async function measurePageLoad(page: Page, url: string) {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // 3 second budget
  return loadTime;
}
```

### Critical User Journey Tests

**Create**: `__tests__/e2e/critical-workflows.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import { loginAsOwner, uploadDocument, switchLanguage } from './utils/test-helpers';

test.describe('Critical User Workflows', () => {
  test('complete document management workflow', async ({ page }) => {
    await loginAsOwner(page);
    
    // Upload document
    await uploadDocument(page, './test-fixtures/sample.pdf', 'Test Document');
    
    // View document
    await page.getByTestId('document-item').first().click();
    await expect(page.getByTestId('pdf-viewer')).toBeVisible();
    
    // Request translation
    await page.getByTestId('translate-button').click();
    await page.selectOption('[data-testid="language-select"]', 'fr');
    await page.getByTestId('request-translation').click();
    
    await expect(page.getByText(/translation requested/i)).toBeVisible();
    
    // Verify translation appears in queue
    await page.goto('/dashboard');
    await expect(page.getByTestId('translation-queue')).toContainText('Test Document');
  });

  test('multilingual navigation and content', async ({ page }) => {
    await page.goto('/');
    
    // Test French
    await switchLanguage(page, 'fr');
    await expect(page.getByTestId('hero-title')).toContainText('Bienvenue');
    
    // Test Arabic (RTL)
    await switchLanguage(page, 'ar');
    await expect(page.getByTestId('main-content')).toHaveCSS('direction', 'rtl');
    
    // Return to English
    await switchLanguage(page, 'en');
    await expect(page.getByTestId('hero-title')).toContainText('Welcome');
  });

  test('admin user management workflow', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navigate to admin panel
    await page.getByTestId('admin-nav').click();
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    
    // Manage users
    await page.getByTestId('users-tab').click();
    await expect(page.getByTestId('users-list')).toBeVisible();
    
    // Change user role
    await page.getByTestId('user-actions').first().click();
    await page.getByTestId('change-role').click();
    await page.selectOption('[data-testid="role-select"]', 'contentEditor');
    await page.getByTestId('save-role').click();
    
    await expect(page.getByText(/role updated/i)).toBeVisible();
  });
});
```

## 📊 Performance Testing Framework

### Load Testing Setup

**Create**: `__tests__/performance/load-testing.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('page load performance benchmarks', async ({ page }) => {
    // Home page load time
    const homeStart = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const homeLoadTime = Date.now() - homeStart;
    
    expect(homeLoadTime).toBeLessThan(2000); // 2s budget for home page
    
    // Dashboard load time (authenticated)
    await loginAsOwner(page);
    const dashboardStart = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const dashboardLoadTime = Date.now() - dashboardStart;
    
    expect(dashboardLoadTime).toBeLessThan(3000); // 3s budget for dashboard
  });

  test('document upload performance', async ({ page }) => {
    await loginAsOwner(page);
    
    // Test small file upload
    const uploadStart = Date.now();
    await uploadDocument(page, './test-fixtures/small.pdf');
    const uploadTime = Date.now() - uploadStart;
    
    expect(uploadTime).toBeLessThan(5000); // 5s budget for small files
  });

  test('search performance', async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/dashboard');
    
    // Search response time
    const searchStart = Date.now();
    await page.getByTestId('search-input').fill('test query');
    await page.waitForSelector('[data-testid="search-results"]');
    const searchTime = Date.now() - searchStart;
    
    expect(searchTime).toBeLessThan(500); // 500ms budget for search
  });
});
```

### Memory and Bundle Size Testing

**Create**: `scripts/performance-monitoring.js`
```javascript
const { spawn } = require('child_process');
const fs = require('fs');

// Bundle size analysis
async function analyzeBundleSize() {
  return new Promise((resolve) => {
    const analyzer = spawn('npx', ['next-bundle-analyzer']);
    analyzer.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Bundle analysis complete');
        resolve();
      }
    });
  });
}

// Lighthouse CI integration
async function runLighthouseCI() {
  return new Promise((resolve) => {
    const lighthouse = spawn('npx', ['lhci', 'autorun']);
    lighthouse.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Lighthouse CI passed');
        resolve();
      }
    });
  });
}

// Memory leak detection
async function checkMemoryLeaks() {
  // Use Playwright with Chrome DevTools Protocol
  console.log('🔍 Checking for memory leaks...');
  // Implementation would use CDP to monitor memory usage
}

module.exports = {
  analyzeBundleSize,
  runLighthouseCI,
  checkMemoryLeaks,
};
```

## 🔒 Enhanced Security Testing

### Permission Testing Enhancement

**Create**: `__tests__/security/enhanced-permissions.test.js`
```javascript
import { createTestUser, createAuthenticatedClient } from '../utils/test-utils';

describe('Enhanced Permission Testing', () => {
  // Test new AI features permissions
  describe('AI Translation Permissions', () => {
    it('should allow contentEditor to request translations', async () => {
      const contentEditor = await createTestUser({ role: 'contentEditor' });
      const supabase = createAuthenticatedClient(contentEditor);

      const { data, error } = await supabase
        .from('translation_jobs')
        .insert({
          document_id: 'test-doc-id',
          target_language: 'fr',
          priority: 'normal'
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should prevent regular users from priority translations', async () => {
      const user = await createTestUser({ role: 'user' });
      const supabase = createAuthenticatedClient(user);

      const { error } = await supabase
        .from('translation_jobs')
        .insert({
          document_id: 'test-doc-id',
          target_language: 'fr',
          priority: 'high' // Should be denied
        });

      expect(error).toBeDefined();
    });
  });

  // Test WhatsApp permissions (Phase 4)
  describe('WhatsApp Integration Permissions', () => {
    it('should allow admins to manage WhatsApp settings', async () => {
      const admin = await createTestUser({ role: 'admin' });
      const supabase = createAuthenticatedClient(admin);

      const { data, error } = await supabase
        .from('whatsapp_settings')
        .update({ digest_frequency: 'weekly' })
        .eq('id', 1);

      expect(error).toBeNull();
    });

    it('should prevent users from accessing WhatsApp logs', async () => {
      const user = await createTestUser({ role: 'user' });
      const supabase = createAuthenticatedClient(user);

      const { error } = await supabase
        .from('whatsapp_message_logs')
        .select('*');

      expect(error).toBeDefined();
      expect(error.code).toBe('42501');
    });
  });
});
```

## 📋 Enhanced Test Scripts

### Update package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=src/",
    "test:integration": "jest --testPathPattern=__tests__/integration/",
    "test:security": "jest --testPathPattern=__tests__/security/",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "jest --testPathPattern=__tests__/performance/",
    "test:ai": "jest --setupFilesAfterEnv='<rootDir>/jest.setup.ai.js'",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:security",
    "test:ci": "npm run test:all && npm run test:e2e",
    "performance:analyze": "node scripts/performance-monitoring.js"
  }
}
```

## 🎯 Success Criteria for Phase 0

### Testing Infrastructure Complete ✅
- [ ] AI testing framework operational with deterministic mocks
- [ ] Playwright E2E tests for critical user journeys
- [ ] Performance testing framework with benchmarks
- [ ] Enhanced security testing for all permission levels
- [ ] Visual regression testing with Storybook

### Test Coverage Targets ✅
- [ ] Unit tests: >95% coverage maintained
- [ ] Integration tests: >85% coverage for new features
- [ ] E2E tests: 100% coverage of critical workflows
- [ ] Security tests: 100% coverage of permission changes
- [ ] Performance tests: All pages under budget thresholds

### Documentation Complete ✅
- [ ] Testing methodology documented
- [ ] AI testing patterns documented
- [ ] E2E test patterns established
- [ ] Performance benchmarks defined
- [ ] Security testing procedures updated

---

This enhanced testing setup provides the foundation for confident, test-driven development of all remaining Costabeach features while maintaining the high quality standards established in the existing codebase.