// Add any global test setup here
import '@testing-library/jest-dom';

// Import Jest globals
import { jest } from '@jest/globals';

// Mock environment variables needed for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMTYzMDgwMCwiZXhwIjoxOTQ3MjA2ODAwfQ.mock-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjMxNjMwODAwLCJleHAiOjE5NDcyMDY4MDB9.mock-service-key';

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

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  const defaultMockData = { id: 'mock-id', title: 'Mock Title', name: 'Mock Name', email: 'mock@example.com' };
  
  // Always return an array with at least one mock item for select calls
  const mockDataArray = [defaultMockData];
  
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
          count: jest.fn().mockResolvedValue({ data: mockDataArray, error: null, count: 1 }),
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