import { createClient } from '../client';
import { createBrowserClient } from '@supabase/ssr';

// Mock the @supabase/ssr package
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

// Mock environment variables
const originalEnv = process.env;

describe('Supabase Browser Client', () => {
  let mockSupabaseClient: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
    };
    
    // Mock the createBrowserClient function
    mockSupabaseClient = {
      auth: {
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
    };
    
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  it('should create a Supabase client with environment variables', () => {
    const client = createClient();
    
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'mock-anon-key'
    );
    
    expect(client).toBe(mockSupabaseClient);
  });
  
  it('should throw an error if environment variables are missing', () => {
    // Remove required environment variables
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Wrap call in a function to catch the error
    const createClientWithoutEnv = () => createClient();
    
    // Since we're using non-null assertion (!) in the code, TypeScript will
    // allow the call but it will fail at runtime if the values are undefined
    expect(createClientWithoutEnv).toThrow();
  });
}); 