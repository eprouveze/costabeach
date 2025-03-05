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