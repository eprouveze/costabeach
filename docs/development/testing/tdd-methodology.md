# Test-Driven Development (TDD) Methodology

## 🎯 Overview

This document outlines the TDD approach for Costabeach development, building upon the excellent existing testing infrastructure. Our methodology emphasizes leveraging proven patterns while extending them for new features.

## 🏗️ Existing Infrastructure Analysis

### Current Testing Strengths ✅
- **32+ test files** with comprehensive coverage
- **Sophisticated mock system** for Supabase, tRPC, and i18n
- **Storybook integration** with atomic design organization
- **Security testing framework** for RLS policies
- **Jest + Testing Library** with TypeScript support
- **Mock providers** for consistent story context

### Infrastructure Enhancement Opportunities
- Add AI-specific testing patterns
- Implement visual regression testing
- Set up E2E testing with Playwright
- Create performance testing framework

## 🔄 TDD Workflow: Red-Green-Refactor Enhanced

### Daily TDD Cycle

```
📅 Morning (9:00-12:00): Red Phase
├── Write failing tests for new feature
├── Define component/API interfaces
├── Set up mock data and providers
└── Verify tests fail for correct reasons

🕐 Afternoon (13:00-17:00): Green Phase  
├── Implement minimum code to pass tests
├── Focus on functionality over optimization
├── Leverage existing patterns and components
└── Verify all tests pass

🌅 Evening (17:00-18:00): Refactor Phase
├── Optimize implementation
├── Extract reusable patterns
├── Update Storybook documentation
└── Review and cleanup code
```

### Weekly Integration Cycle

```
📊 Monday: Sprint planning + test architecture
📝 Tuesday-Thursday: Feature development (Red-Green-Refactor)
🔄 Friday: Integration testing + documentation updates
```

## 🧪 Testing Patterns by Feature Type

### 1. Component Testing (Atoms → Organisms)

**Pattern**: Leverage existing Storybook + Testing Library setup

```typescript
// Example: PDF Viewer Component
// File: src/components/DocumentViewer.test.tsx

describe('DocumentViewer', () => {
  // Red: Define failing test first
  it('should display PDF in iframe', async () => {
    const mockDocument = createMockDocument();
    render(
      <StoryProviders withTRPC>
        <DocumentViewer document={mockDocument} />
      </StoryProviders>
    );
    
    expect(screen.getByTestId('pdf-iframe')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-iframe')).toHaveAttribute(
      'src', 
      expect.stringContaining(mockDocument.url)
    );
  });

  // Green: Implement component
  // Refactor: Optimize and extract patterns
});
```

**Storybook Integration**:
```typescript
// File: src/stories/organisms/DocumentViewer.stories.tsx
export default {
  title: 'Organisms/DocumentViewer',
  component: DocumentViewer,
  decorators: [createStoryDecorator({ withTRPC: true })],
};

export const Default: Story = {
  args: {
    document: mockDocuments.pdfDocument,
  },
};

export const Loading: Story = {
  args: {
    document: null,
  },
};
```

### 2. API Testing (tRPC Procedures)

**Pattern**: Extend existing tRPC mock patterns

```typescript
// Example: Translation API
// File: src/lib/api/routers/translations.test.ts

describe('translations router', () => {
  // Red: Define API contract first
  it('should initiate document translation', async () => {
    const mockUser = createMockUser({ role: 'contentEditor' });
    const mockDocument = createMockDocument();
    
    const result = await trpcCaller(mockUser).translations.requestTranslation({
      documentId: mockDocument.id,
      targetLanguage: 'fr',
    });

    expect(result).toMatchObject({
      jobId: expect.any(String),
      status: 'pending',
      estimatedCompletion: expect.any(Date),
    });
  });

  // Green: Implement tRPC procedure
  // Refactor: Extract validation logic
});
```

### 3. AI Feature Testing (OpenAI/DeepL)

**Pattern**: Create deterministic mock strategies

```typescript
// File: src/lib/ai/translation.test.ts

describe('AI Translation Service', () => {
  beforeEach(() => {
    // Mock OpenAI for consistent responses
    jest.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [{ 
        message: { 
          content: 'Mock translated content' 
        } 
      }],
    });
  });

  // Red: Define AI behavior expectations
  it('should translate document content', async () => {
    const result = await translateDocument({
      content: 'Hello world',
      targetLanguage: 'fr',
    });

    expect(result).toEqual({
      translatedContent: expect.stringContaining('Mock translated'),
      sourceLanguage: 'en',
      targetLanguage: 'fr',
      confidence: expect.any(Number),
    });
  });

  // Green: Implement with API
  // Refactor: Add caching and error handling
});
```

### 4. Database Testing (RLS Policies)

**Pattern**: Build on existing security test framework

```typescript
// File: __tests__/security/polls-rls.test.js

describe('Polls RLS Policies', () => {
  // Red: Define security requirements first
  it('should allow contentEditor to create polls', async () => {
    const contentEditor = await createTestUser({ role: 'contentEditor' });
    const supabase = createAuthenticatedClient(contentEditor);

    const { data, error } = await supabase
      .from('polls')
      .insert({
        question: 'Test poll question',
        options: ['Option A', 'Option B'],
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should prevent regular users from creating polls', async () => {
    const regularUser = await createTestUser({ role: 'user' });
    const supabase = createAuthenticatedClient(regularUser);

    const { data, error } = await supabase
      .from('polls')
      .insert({
        question: 'Unauthorized poll',
        options: ['Option A', 'Option B'],
      });

    expect(error).toBeDefined();
    expect(error.code).toBe('42501'); // insufficient_privilege
  });

  // Green: Implement RLS policies
  // Refactor: Optimize policy performance
});
```

### 5. Integration Testing (E2E Workflows)

**Pattern**: Use Playwright for critical user journeys

```typescript
// File: __tests__/e2e/document-workflow.spec.ts

test.describe('Document Management Workflow', () => {
  // Red: Define complete user journey
  test('owner can upload, view, and request translation', async ({ page }) => {
    await loginAsOwner(page);
    
    // Upload document
    await page.goto('/dashboard');
    await page.getByTestId('upload-button').click();
    await page.setInputFiles('[data-testid="file-input"]', 'test-document.pdf');
    await page.getByTestId('upload-submit').click();
    
    // Verify upload success
    await expect(page.getByText('Document uploaded successfully')).toBeVisible();
    
    // View document
    await page.getByTestId('document-item').first().click();
    await expect(page.getByTestId('pdf-viewer')).toBeVisible();
    
    // Request translation
    await page.getByTestId('translate-button').click();
    await page.selectOption('[data-testid="language-select"]', 'fr');
    await page.getByTestId('request-translation').click();
    
    await expect(page.getByText('Translation requested')).toBeVisible();
  });

  // Green: Implement features step by step
  // Refactor: Extract reusable page objects
});
```

## 📊 Test Coverage Strategy

### Coverage Targets by Layer

```
Unit Tests (Jest + Testing Library):
├── Components: >95% coverage
├── Utilities: >98% coverage
├── API Routes: >90% coverage
└── Business Logic: >95% coverage

Integration Tests:
├── tRPC Workflows: >85% coverage
├── Database Operations: >90% coverage
├── Authentication Flows: >95% coverage
└── Permission Systems: >90% coverage

E2E Tests (Playwright):
├── Critical User Journeys: 100% coverage
├── Authentication Flows: 100% coverage
├── Document Management: 100% coverage
└── Admin Operations: 80% coverage
```

### Testing Pyramid Distribution

```
     🔺 E2E Tests (10%)
       Critical user journeys
       Cross-browser compatibility
       Performance validation

    🔶 Integration Tests (30%)
      API workflows
      Database operations
      Component interactions
      Security policies

  🔷 Unit Tests (60%)
    Individual components
    Utility functions
    Business logic
    Mock interactions
```

## 🚀 Leveraging Existing Infrastructure

### Mock Provider Enhancement

**Current**: `StoryProviders` with i18n, tRPC, Session support
**Enhancement**: Add AI, WhatsApp, and E2E mocks

```typescript
// File: src/stories/utils/EnhancedStoryProviders.tsx

interface EnhancedStoryProvidersProps extends StoryProvidersProps {
  withAI?: boolean;
  withWhatsApp?: boolean;
  aiResponses?: Record<string, any>;
  whatsappMessages?: Array<any>;
}

export const EnhancedStoryProviders: React.FC<EnhancedStoryProvidersProps> = ({
  children,
  withAI = false,
  withWhatsApp = false,
  aiResponses = {},
  whatsappMessages = [],
  ...baseProps
}) => {
  let content = children;

  if (withWhatsApp) {
    content = (
      <MockWhatsAppProvider messages={whatsappMessages}>
        {content}
      </MockWhatsAppProvider>
    );
  }

  if (withAI) {
    content = (
      <MockAIProvider responses={aiResponses}>
        {content}
      </MockAIProvider>
    );
  }

  return (
    <StoryProviders {...baseProps}>
      {content}
    </StoryProviders>
  );
};
```

### Jest Configuration Enhancement

**Build on existing**: `jest.config.cjs` with TypeScript support
**Add**: AI mocking, performance testing, snapshot testing

```javascript
// File: jest.config.enhanced.cjs
const baseConfig = require('./jest.config.cjs');

module.exports = {
  ...baseConfig,
  projects: [
    // Unit tests
    {
      ...baseConfig,
      testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
        '<rootDir>/jest.setup.ai.js', // New AI mocks
      ],
    },
    // Integration tests
    {
      ...baseConfig,
      testMatch: ['<rootDir>/__tests__/integration/**/*.test.{ts,tsx}'],
      testEnvironment: 'jsdom',
    },
    // Security tests
    {
      ...baseConfig,
      testMatch: ['<rootDir>/__tests__/security/**/*.test.js'],
      testEnvironment: 'node',
    },
  ],
};
```

## 🔄 Feature Development Workflow

### Phase 0: Enhanced Testing Setup

**Week 1 TDD Focus**:
```
Day 1: AI Mock Framework
├── Red: Write tests for OpenAI/DeepL mocking
├── Green: Implement deterministic AI responses
└── Refactor: Extract reusable AI test utilities

Day 2: Database Schema Testing
├── Red: Write tests for all new tables/relationships
├── Green: Implement schema migrations
└── Refactor: Optimize RLS policies

Day 3: E2E Infrastructure
├── Red: Write failing E2E tests for core workflows
├── Green: Set up Playwright configuration
└── Refactor: Create page object patterns

Day 4-5: Integration and Documentation
├── Integrate all testing enhancements
├── Update testing documentation
└── Create testing guidelines for team
```

### Phase 2: Document Features TDD

**Example: PDF Viewer Implementation**
```
Red Phase (Morning):
├── Write component interface tests
├── Define props and behavior expectations
├── Set up Storybook stories (failing)
└── Create integration test scenarios

Green Phase (Afternoon):
├── Implement basic PDF.js wrapper
├── Add TypeScript types
├── Create responsive container
└── Make all tests pass

Refactor Phase (Evening):
├── Extract PDF utilities
├── Optimize performance
├── Add accessibility features
└── Update Storybook documentation
```

## 📋 Quality Gates

### Pre-Commit Hooks (Existing + Enhanced)
```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test:unit
npm run test:integration  # New
npm run test:security     # Enhanced
```

### PR Requirements
- [ ] All tests passing (unit + integration)
- [ ] Test coverage >90% for new code
- [ ] Storybook stories for new components
- [ ] Security tests for permission changes
- [ ] Performance tests for critical paths
- [ ] Documentation updates

### Definition of Done
- [ ] Feature works in all supported browsers
- [ ] Multilingual support (FR/AR/EN)
- [ ] Responsive design (mobile + desktop)
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Performance meets benchmarks
- [ ] Security review passed
- [ ] Documentation complete

## 🎯 Success Metrics

### Test Quality Metrics
```
Test Coverage: >95% (unit) / >85% (integration)
Test Performance: <30s full suite execution
Test Reliability: <1% flaky test rate
Documentation Coverage: 100% public APIs
```

### Development Velocity Metrics
```
Story Points per Sprint: 20-24 (2 weeks)
Bug Escape Rate: <5% to production
Feature Completion Rate: >90% on-time delivery
Code Review Cycle Time: <24 hours
```

### Code Quality Metrics
```
TypeScript Coverage: >98%
ESLint Violations: 0 errors
Security Violations: 0 critical/high
Performance Budget: <3s page load
```

---

This TDD methodology builds upon our excellent existing infrastructure while adding the enhancements needed for AI features, WhatsApp integration, and production-ready quality assurance.