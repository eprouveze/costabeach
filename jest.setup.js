// Add any global test setup here
require('@testing-library/jest-dom');

// Suppress console error logs in tests to reduce noise
const originalConsoleError = console.error;
console.error = (...args) => {
  // Don't output console errors about acts or jest-dom in tests
  if (
    args[0] && 
    (args[0].includes('Warning: ReactDOM.render') || 
     args[0].includes('Warning: An update to') ||
     args[0].includes('Warning: The current testing environment'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock environment variables needed for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMTYzMDgwMCwiZXhwIjoxOTQ3MjA2ODAwfQ.mock-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjMxNjMwODAwLCJleHAiOjE5NDcyMDY4MDB9.mock-service-key';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  // Create multiple mock data items to ensure we always have data to return
  const mockDataItems = [
    { 
      id: 'mock-id-1', 
      title: 'Mock Title 1', 
      name: 'Mock Name 1', 
      email: 'mock1@example.com',
      user_id: 'test-user-id',
      role: 'admin'
    },
    { 
      id: 'mock-id-2', 
      title: 'Mock Title 2', 
      name: 'Mock Name 2', 
      email: 'mock2@example.com',
      user_id: 'editor-id',
      role: 'content_editor'
    },
    { 
      id: 'mock-id-3', 
      title: 'Mock Title 3', 
      name: 'Mock Name 3', 
      email: 'mock3@example.com',
      user_id: 'user-id',
      role: undefined
    }
  ];
  
  // Always return an array with mock items for select calls
  const mockDataArray = [...mockDataItems];
  const defaultMockData = mockDataItems[0];
  
  return {
    createClient: jest.fn(() => ({
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ 
          data: { 
            user: { id: 'test-user-id' },
            session: { access_token: 'mock-token' } 
          }, 
          error: null 
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
        getSession: jest.fn().mockResolvedValue({ 
          data: { 
            session: { 
              user: { id: 'test-user-id' },
              access_token: 'mock-token'
            } 
          }, 
          error: null 
        }),
        session: jest.fn().mockReturnValue({ user: { id: 'test-user-id' } })
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ data: mockDataArray, error: null }),
          in: jest.fn().mockResolvedValue({ data: mockDataArray, error: null }),
          limit: jest.fn().mockResolvedValue({ data: mockDataArray, error: null }),
          single: jest.fn().mockResolvedValue({ data: defaultMockData, error: null }),
          execute: jest.fn().mockResolvedValue({ data: mockDataArray, error: null }),
          order: jest.fn().mockReturnThis(),
          match: jest.fn().mockReturnThis(),
          count: jest.fn().mockResolvedValue({ data: mockDataArray, error: null, count: mockDataArray.length }),
        })),
        insert: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({ data: mockDataArray, error: null }),
          execute: jest.fn().mockResolvedValue({ data: defaultMockData, error: null }),
        })),
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ data: defaultMockData, error: null }),
          match: jest.fn().mockResolvedValue({ data: defaultMockData, error: null }),
          execute: jest.fn().mockResolvedValue({ data: defaultMockData, error: null }),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
          match: jest.fn().mockResolvedValue({ data: null, error: null }),
          execute: jest.fn().mockResolvedValue({ data: null, error: null }),
          in: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
    SupabaseClient: jest.fn(),
  };
});

// Enhanced AI Service Mocks for Phase 2+ Development
// Following TDD methodology - deterministic, predictable responses

// Conditional AI service mocks - only mock if dependencies will be installed
if (process.env.NODE_ENV === 'test') {
  // OpenAI Mock - set up factory for when openai package is installed
  global.__mockOpenAI = {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async ({ messages, model }) => {
            const lastMessage = messages[messages.length - 1];
            const content = lastMessage.content.toLowerCase();
            
            // Deterministic responses based on content for reliable testing
            if (content.includes('translate')) {
              return {
                choices: [{
                  message: {
                    content: JSON.stringify({
                      translation: 'Mock translated text',
                      confidence: 0.95,
                      notes: 'Translation completed successfully'
                    })
                  }
                }],
                usage: { total_tokens: 150 }
              };
            }
            
            if (content.includes('quality') || content.includes('validate')) {
              return {
                choices: [{
                  message: { content: '0.85' }
                }],
                usage: { total_tokens: 50 }
              };
            }
            
            if (content.includes('playground') || content.includes('hoa')) {
              return {
                choices: [{
                  message: {
                    content: 'Based on the HOA documents, the playground installation requires board approval and follows community guidelines.'
                  }
                }],
                usage: { total_tokens: 100 }
              };
            }
            
            // Default response for other queries
            return {
              choices: [{
                message: { content: 'Mock AI response for testing' }
              }],
              usage: { total_tokens: 75 }
            };
          }),
        },
      },
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{
            embedding: new Array(1536).fill(0).map(() => Math.random() - 0.5) // Mock embedding vector
          }],
          usage: { total_tokens: 25 }
        })
      }
    })),
  };

  // DeepL Mock - set up factory for when deepl-node package is installed  
  global.__mockDeepL = {
    Translator: jest.fn().mockImplementation(() => ({
      translateText: jest.fn().mockImplementation(async (text, sourceLang, targetLang) => {
        // Simulate processing delay for realistic testing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
          text: `[DeepL Mock] Translated: ${text.substring(0, 50)}...`,
          detectedSourceLang: sourceLang || 'EN',
          billedCharacters: text.length
        };
      }),
      getUsage: jest.fn().mockResolvedValue({
        character: { count: 1000, limit: 500000 }
      }),
      getSourceLanguages: jest.fn().mockResolvedValue([
        { code: 'EN', name: 'English' },
        { code: 'FR', name: 'French' },
        { code: 'AR', name: 'Arabic' }
      ]),
      getTargetLanguages: jest.fn().mockResolvedValue([
        { code: 'EN', name: 'English' },
        { code: 'FR', name: 'French' },
        { code: 'AR', name: 'Arabic' }
      ])
    }))
  };
}

// Mock WhatsApp Business API for Phase 4
jest.mock('axios', () => ({
  default: {
    post: jest.fn().mockImplementation(async (url, data) => {
      if (url.includes('messages')) {
        return {
          data: {
            messages: [{
              id: `whatsapp_${Date.now()}`,
              status: 'sent'
            }]
          }
        };
      }
      
      if (url.includes('message_templates')) {
        return {
          data: {
            data: [
              { id: 'template_1', name: 'verification_code', status: 'APPROVED' },
              { id: 'template_2', name: 'weekly_digest', status: 'APPROVED' }
            ]
          }
        };
      }
      
      return { data: { success: true } };
    }),
    get: jest.fn().mockResolvedValue({
      data: { data: [] }
    })
  },
  ...jest.requireActual('axios')
}));

// Global test utilities for AI features
global.createMockAIResponse = (type, content) => {
  switch (type) {
    case 'translation':
      return {
        translation: content || 'Mock translation result',
        confidence: 0.95,
        notes: 'Mock translation notes'
      };
    case 'summary':
      return {
        summary: content || 'Mock document summary',
        key_points: ['Point 1', 'Point 2', 'Point 3'],
        confidence: 0.88
      };
    case 'qa_response':
      return {
        answer: content || 'Mock Q&A response',
        sources: ['doc1', 'doc2'],
        confidence: 0.82
      };
    case 'quality_score':
      return parseFloat(content) || 0.85;
    default:
      return { content: content || 'Mock AI content' };
  }
};

// Mock translation data following existing pattern
global.mockTranslationData = [
  {
    id: 'translation-1',
    document_id: 'mock-id-1',
    source_language: 'en',
    target_language: 'fr',
    status: 'completed',
    confidence_score: 0.95,
    quality_score: 0.88,
    translated_content: 'Contenu traduit simulé',
    requested_by: 'test-user-id',
    service_used: 'deepl',
    actual_cost_cents: 25,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  },
  {
    id: 'translation-2',
    document_id: 'mock-id-2',
    source_language: 'fr',
    target_language: 'ar',
    status: 'in_progress',
    progress: 65,
    confidence_score: null,
    requested_by: 'editor-id',
    service_used: 'openai',
    estimated_cost_cents: 35,
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString()
  },
  {
    id: 'translation-3',
    document_id: 'mock-id-3',
    source_language: 'en',
    target_language: 'ar',
    status: 'failed',
    error_message: 'Mock translation error for testing',
    requested_by: 'user-id',
    service_used: 'openai',
    created_at: new Date().toISOString()
  }
];

// Mock poll data following existing pattern
global.mockPollData = [
  {
    id: 'poll-1',
    question: 'Should we install a new playground?',
    description: 'Community playground installation proposal',
    poll_type: 'single_choice',
    status: 'published',
    is_anonymous: true,
    allow_comments: true,
    created_by: 'test-user-id',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    options: [
      { id: 'opt-1', option_text: 'Yes, install it', order_index: 0 },
      { id: 'opt-2', option_text: 'No, not needed', order_index: 1 },
      { id: 'opt-3', option_text: 'Need more information', order_index: 2 }
    ]
  },
  {
    id: 'poll-2',
    question: 'What color should the new benches be?',
    poll_type: 'multiple_choice',
    status: 'draft',
    is_anonymous: false,
    created_by: 'editor-id',
    options: [
      { id: 'opt-4', option_text: 'Brown wood finish', order_index: 0 },
      { id: 'opt-5', option_text: 'Black metal', order_index: 1 },
      { id: 'opt-6', option_text: 'Green to match landscape', order_index: 2 }
    ]
  }
];

// Mock WhatsApp contact data
global.mockWhatsAppData = [
  {
    id: 'contact-1',
    user_id: 'test-user-id',
    phone_number: '+33123456789',
    status: 'opted_in',
    verification_code: '123456',
    verified_at: new Date().toISOString(),
    user: { name: 'Test User', language: 'fr' }
  },
  {
    id: 'contact-2',
    user_id: 'editor-id',
    phone_number: '+212987654321',
    status: 'opted_in',
    verification_code: '654321',
    verified_at: new Date().toISOString(),
    user: { name: 'Content Editor', language: 'ar' }
  }
];

// Performance testing utilities
global.createConcurrentRequests = async (count, requestFn) => {
  const requests = Array(count).fill().map((_, i) => 
    requestFn(`request-${i}`)
  );
  
  const startTime = Date.now();
  const results = await Promise.allSettled(requests);
  const endTime = Date.now();
  
  return {
    duration: endTime - startTime,
    successful: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
    averageTime: (endTime - startTime) / count
  };
};

// Polyfill for Next.js Request/Response objects
global.Request = global.Request || class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
    this._body = options.body;
  }
  
  async json() {
    return JSON.parse(this._body || '{}');
  }
  
  async text() {
    return this._body || '';
  }
};

global.Response = global.Response || class Response {
  constructor(body, options = {}) {
    this._body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new Map(Object.entries(options.headers || {}));
  }
  
  async json() {
    return JSON.parse(this._body || '{}');
  }
  
  async text() {
    return this._body || '';
  }
};

global.Headers = global.Headers || class Headers {
  constructor(init) {
    this._headers = new Map();
    if (init) {
      for (const [key, value] of Object.entries(init)) {
        this._headers.set(key.toLowerCase(), value);
      }
    }
  }
  
  get(name) {
    return this._headers.get(name.toLowerCase());
  }
  
  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }
  
  has(name) {
    return this._headers.has(name.toLowerCase());
  }
  
  entries() {
    return this._headers.entries();
  }
};

// Console log for test setup confirmation
console.log('✅ Enhanced testing infrastructure loaded: Supabase + AI + WhatsApp + Performance mocks');