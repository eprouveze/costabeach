# Existing Test Patterns

## 🎯 Overview

This document analyzes the excellent existing testing infrastructure in the Costabeach project and provides patterns for extending it to support new features. The current setup demonstrates sophisticated testing practices that we'll build upon.

## 🏗️ Current Testing Infrastructure Analysis

### Jest Configuration Excellence ✅

**From**: `jest.config.cjs`
```javascript
// Sophisticated TypeScript + ESM setup
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|@supabase|@testing-library)/)'
  ],
  moduleNameMapping: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}
```

**Key Strengths**:
- TypeScript support with ESM handling
- Proper module mapping for path aliases
- Transform ignore patterns for node_modules
- Centralized test setup configuration

### Mock Infrastructure Excellence ✅

**From**: `jest.setup.js` (112 lines of sophisticated mocking)
```javascript
// Comprehensive Supabase mocking
const mockDataItems = [
  { id: 'mock-id-1', title: 'Mock Title 1', user_id: 'test-user-id', role: 'admin' },
  { id: 'mock-id-2', title: 'Mock Title 2', user_id: 'editor-id', role: 'content_editor' },
  { id: 'mock-id-3', title: 'Mock Title 3', user_id: 'user-id', role: undefined }
];

// Always return arrays for consistent testing
const mockDataArray = [...mockDataItems];
const defaultMockData = mockDataItems[0];

// Sophisticated chaining mock implementation
from: jest.fn(() => ({
  select: jest.fn(() => ({
    eq: jest.fn().mockResolvedValue({ data: mockDataArray, error: null }),
    in: jest.fn().mockResolvedValue({ data: mockDataArray, error: null }),
    single: jest.fn().mockResolvedValue({ data: defaultMockData, error: null }),
    // ... complete query builder API mocked
  }))
}))
```

**Key Strengths**:
- Multiple mock data items for varied test scenarios
- Complete Supabase query builder API coverage
- Consistent return patterns (always arrays for lists)
- Proper error/success state simulation

### Storybook Integration Excellence ✅

**From**: `.storybook/preview.tsx`
```typescript
// Atomic Design organization
const atomicDesignOrder = [
  'Documentation', 'Design System', 'Atoms', 
  'Molecules', 'Organisms', 'Templates', 'Pages'
];

// Comprehensive provider setup
decorators: [
  (Story) => (
    <StoryProviders>
      <div className="p-4">
        <Story />
      </div>
    </StoryProviders>
  ),
]
```

**From**: `src/stories/utils/StoryProviders.tsx` (75 lines)
```typescript
// Flexible provider composition
export const StoryProviders: React.FC<StoryProvidersProps> = ({
  children,
  withI18n = true,
  withTRPC = true,
  withSession = false,
  i18nMessages = {},
  locale = 'en',
}) => {
  // Conditional provider wrapping based on needs
  let content = children;
  
  if (withSession) content = <SessionProvider>{content}</SessionProvider>;
  if (withTRPC) content = <MockTRPCProvider>{content}</MockTRPCProvider>;
  if (withI18n) content = <MockI18nProvider>{content}</MockI18nProvider>;
  
  return content;
};
```

**Key Strengths**:
- Atomic design principle organization
- Flexible provider composition
- Conditional wrapping based on component needs
- Consistent context across all stories

## 🧪 Test Pattern Extensions for New Features

### Pattern 1: AI Feature Testing

**Extend**: `jest.setup.js` for AI mocking
```javascript
// Add to existing jest.setup.js
// Mock OpenAI with deterministic responses
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockImplementation(async ({ messages }) => {
          const content = messages[messages.length - 1].content.toLowerCase();
          
          if (content.includes('translate')) {
            return {
              choices: [{ message: { content: JSON.stringify({
                translated_text: 'Mock translation result',
                confidence: 0.95
              })}}]
            };
          }
          
          return {
            choices: [{ message: { content: 'Mock AI response' }}]
          };
        }),
      },
    },
  })),
}));

// Export utilities for test files
global.createMockAIResponse = (type, content) => {
  // Reusable AI response creators
  switch (type) {
    case 'translation': return { translated_text: content, confidence: 0.95 };
    case 'summary': return { summary: content, key_points: ['Point 1'] };
    default: return { content };
  }
};
```

### Pattern 2: Enhanced Provider System

**Extend**: `src/stories/utils/StoryProviders.tsx`
```typescript
// Enhanced provider with AI and WhatsApp support
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

  // Layer additional providers using existing pattern
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

  // Use existing base providers
  return (
    <StoryProviders {...baseProps}>
      {content}
    </StoryProviders>
  );
};
```

### Pattern 3: Security Test Extension

**Build on**: Existing RLS test patterns in `__tests__/security/`
```typescript
// Follow existing security test structure
describe('Enhanced RLS Policies', () => {
  // Use existing createTestUser pattern
  it('should enforce translation permissions', async () => {
    const contentEditor = await createTestUser({ role: 'contentEditor' });
    const regularUser = await createTestUser({ role: 'user' });
    
    // Use existing auth client pattern
    const editorClient = createAuthenticatedClient(contentEditor);
    const userClient = createAuthenticatedClient(regularUser);
    
    // Test new table permissions following existing patterns
    const { data: editorAccess } = await editorClient
      .from('document_translations')
      .insert({ document_id: 'test', target_language: 'fr' });
    
    expect(editorAccess).toBeDefined();
    
    const { error: userError } = await userClient
      .from('document_translations')
      .update({ priority: 'high' })
      .eq('id', 'test');
    
    expect(userError).toBeDefined();
    expect(userError.code).toBe('42501'); // Following existing error pattern
  });
});
```

## 🔄 Test Data Management Patterns

### Existing Mock Data Patterns ✅

**From**: `jest.setup.js`
```javascript
// Multiple data items for varied scenarios
const mockDataItems = [
  { id: 'mock-id-1', role: 'admin' },      // Admin scenario
  { id: 'mock-id-2', role: 'content_editor' }, // Editor scenario  
  { id: 'mock-id-3', role: undefined }     // Regular user scenario
];

// Consistent array returns
const mockDataArray = [...mockDataItems];
```

### Extended Mock Data for New Features

**Add to**: Test utilities
```typescript
// Translation mock data following existing pattern
export const mockTranslationData = [
  {
    id: 'translation-1',
    status: 'completed',
    target_language: 'fr',
    confidence_score: 0.95,
    requested_by: 'test-user-id'
  },
  {
    id: 'translation-2', 
    status: 'pending',
    target_language: 'ar',
    confidence_score: null,
    requested_by: 'editor-id'
  },
  {
    id: 'translation-3',
    status: 'failed',
    target_language: 'en',
    error_message: 'Mock error',
    requested_by: 'user-id'
  }
];

// Poll mock data following existing pattern
export const mockPollData = [
  {
    id: 'poll-1',
    question: 'Should we install a playground?',
    status: 'published',
    created_by: 'test-user-id',
    options: [
      { id: 'opt-1', option_text: 'Yes', vote_count: 15 },
      { id: 'opt-2', option_text: 'No', vote_count: 5 }
    ]
  }
];
```

## 📊 Component Testing Patterns

### Existing Pattern ✅
```typescript
// From successful existing tests
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <StoryProviders withTRPC withI18n>
      {component}
    </StoryProviders>
  );
};

describe('ComponentName', () => {
  it('renders correctly with mock data', () => {
    renderWithProviders(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Extended Pattern for New Components
```typescript
// Enhanced rendering utility
const renderComponentWithContext = (
  component: React.ReactElement,
  options: {
    withAI?: boolean;
    withWhatsApp?: boolean;
    locale?: string;
    userRole?: string;
  } = {}
) => {
  return render(
    <EnhancedStoryProviders 
      withTRPC 
      withI18n 
      withAI={options.withAI}
      withWhatsApp={options.withWhatsApp}
      locale={options.locale}
    >
      {component}
    </EnhancedStoryProviders>
  );
};

// Usage following existing patterns
describe('DocumentViewer', () => {
  it('renders PDF viewer correctly', () => {
    renderComponentWithContext(
      <DocumentViewer documentId="test-doc" />,
      { userRole: 'admin' }
    );
    
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
  });

  it('handles translation requests', async () => {
    renderComponentWithContext(
      <TranslationInterface documentId="test-doc" />,
      { withAI: true }
    );
    
    // Use existing user event patterns
    await userEvent.click(screen.getByText('Request Translation'));
    expect(screen.getByText('Translation requested')).toBeInTheDocument();
  });
});
```

## 🚀 Integration Test Patterns

### Build on Existing Structure
```typescript
// Extend existing integration test patterns in __tests__/integration/
describe('Translation Workflow Integration', () => {
  beforeEach(async () => {
    // Use existing cleanup patterns
    await clearTestData();
    await setupTestUsers();
  });

  it('completes end-to-end translation workflow', async () => {
    // Follow existing test user creation pattern
    const contentEditor = await createTestUser({ role: 'contentEditor' });
    
    // Use existing API test patterns
    const { data: translation } = await apiCall({
      endpoint: '/api/translations/request',
      method: 'POST',
      user: contentEditor,
      body: {
        documentId: 'test-doc',
        targetLanguage: 'fr'
      }
    });
    
    expect(translation.status).toBe('pending');
    
    // Simulate background job completion following existing patterns
    await processBackgroundJobs();
    
    const { data: completed } = await apiCall({
      endpoint: `/api/translations/${translation.id}`,
      method: 'GET',
      user: contentEditor
    });
    
    expect(completed.status).toBe('completed');
  });
});
```

## 🎯 Quality Assurance Patterns

### Existing Coverage Excellence ✅
- **32+ test files** with comprehensive scenarios
- **Multiple user role testing** (admin, editor, user)
- **Error and success state coverage**
- **Consistent mock data patterns**

### Extended Coverage for New Features

**Translation Testing**:
- Service integration tests (DeepL, OpenAI)
- Background job processing tests
- Quality scoring validation tests
- Multi-language workflow tests

**Poll Testing**:
- Anonymous voting enforcement tests
- Real-time results update tests
- Permission-based access tests
- Multi-language poll content tests

**WhatsApp Testing**:
- Webhook validation tests
- Message delivery simulation tests
- Q&A assistant response tests
- Opt-in/opt-out flow tests

## 📋 Best Practices from Existing Code

### 1. Consistent Mock Strategy ✅
- Always provide multiple data items for varied scenarios
- Use arrays for list responses, single objects for detail responses
- Include both success and error scenarios
- Maintain realistic data relationships

### 2. Provider Composition Pattern ✅
- Conditional provider wrapping based on component needs
- Flexible configuration through props
- Reusable across Storybook and tests
- Clear separation of concerns

### 3. Test Organization Excellence ✅
- Security tests isolated in dedicated directory
- Integration tests separate from unit tests
- Atomic design principles in Storybook organization
- Clear naming conventions and file structure

### 4. Performance-Conscious Testing ✅
- Efficient mock implementations
- Minimal provider overhead
- Reusable test utilities
- Fast test execution

## 🎯 Success Metrics

### Test Quality Indicators ✅
- **Coverage**: >95% for new features (matching existing standards)
- **Reliability**: <1% flaky test rate
- **Performance**: Test suite executes in <30 seconds
- **Maintainability**: Tests easy to update when features change

### Integration Quality ✅
- **Mock Consistency**: All new mocks follow existing patterns
- **Provider Extension**: New providers integrate seamlessly
- **Story Organization**: Maintains atomic design structure
- **Security Testing**: All new features have permission tests

---

This analysis of existing test patterns provides a solid foundation for extending the testing infrastructure while maintaining the high quality standards already established. The sophisticated existing setup demonstrates excellent testing practices that we'll build upon rather than replace.