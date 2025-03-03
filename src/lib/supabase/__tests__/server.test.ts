import { createClient } from '../server';
import { createServerClient } from '@supabase/ssr';

// Mock the Supabase ssr client
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// Mock environment variables
const originalEnv = process.env;

describe('Supabase Server Client', () => {
  let mockSupabaseClient: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'mock-anon-key',
    };
    
    // Mock the createServerClient function
    mockSupabaseClient = {};
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  it('should create a Supabase client with environment variables', () => {
    const client = createClient();
    
    expect(createServerClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'mock-anon-key',
      expect.objectContaining({
        cookies: expect.any(Object),
      })
    );
    
    expect(client).toBe(mockSupabaseClient);
  });
  
  describe('Cookie Management', () => {
    describe('get method', () => {
      it('should handle cookie retrieval in App Router context', () => {
        // Mock require to return mock cookies object
        jest.mock('next/headers', () => ({
          cookies: jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue({ value: 'cookie-value' }),
          }),
        }), { virtual: true });
        
        const client = createClient();
        
        // Extract the cookies object passed to createServerClient
        const cookiesObj = (createServerClient as jest.Mock).mock.calls[0][2].cookies;
        
        // Test the get method
        const result = cookiesObj.get('test-cookie');
        
        // The result should be the cookie value
        expect(result).toBe('cookie-value');
        
        // Clear the mock
        jest.dontMock('next/headers');
      });
      
      it('should handle cookie retrieval errors and return undefined', () => {
        // Force an error when importing next/headers
        jest.mock('next/headers', () => {
          throw new Error('Cannot use headers in this context');
        }, { virtual: true });
        
        // Mock console.warn to avoid test output noise
        const originalWarn = console.warn;
        console.warn = jest.fn();
        
        const client = createClient();
        
        // Extract the cookies object passed to createServerClient
        const cookiesObj = (createServerClient as jest.Mock).mock.calls[0][2].cookies;
        
        // Test the get method
        const result = cookiesObj.get('test-cookie');
        
        // The result should be undefined when an error occurs
        expect(result).toBeUndefined();
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Warning: Unable to access cookies'),
          expect.any(String)
        );
        
        // Restore console.warn
        console.warn = originalWarn;
        
        // Clear the mock
        jest.dontMock('next/headers');
      });
    });
    
    describe('set method', () => {
      it('should handle cookie setting in App Router context', () => {
        // Create a mock set function
        const mockSet = jest.fn();
        
        // Mock require to return mock cookies object
        jest.mock('next/headers', () => ({
          cookies: jest.fn().mockReturnValue({
            set: mockSet,
          }),
        }), { virtual: true });
        
        const client = createClient();
        
        // Extract the cookies object passed to createServerClient
        const cookiesObj = (createServerClient as jest.Mock).mock.calls[0][2].cookies;
        
        // Test the set method
        cookiesObj.set('test-cookie', 'new-value', { maxAge: 3600 });
        
        // The mock set function should be called with the right arguments
        expect(mockSet).toHaveBeenCalledWith('test-cookie', 'new-value', { maxAge: 3600 });
        
        // Clear the mock
        jest.dontMock('next/headers');
      });
      
      it('should handle cookie setting errors', () => {
        // Force an error when importing next/headers
        jest.mock('next/headers', () => {
          throw new Error('Cannot use headers in this context');
        }, { virtual: true });
        
        // Mock console.warn to avoid test output noise
        const originalWarn = console.warn;
        console.warn = jest.fn();
        
        const client = createClient();
        
        // Extract the cookies object passed to createServerClient
        const cookiesObj = (createServerClient as jest.Mock).mock.calls[0][2].cookies;
        
        // Test the set method
        cookiesObj.set('test-cookie', 'new-value', { maxAge: 3600 });
        
        // Warning should be logged
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Warning: Unable to set cookie'),
          expect.any(String)
        );
        
        // Restore console.warn
        console.warn = originalWarn;
        
        // Clear the mock
        jest.dontMock('next/headers');
      });
    });
    
    describe('remove method', () => {
      it('should handle cookie removal in App Router context', () => {
        // Create a mock set function
        const mockSet = jest.fn();
        
        // Mock require to return mock cookies object
        jest.mock('next/headers', () => ({
          cookies: jest.fn().mockReturnValue({
            set: mockSet,
          }),
        }), { virtual: true });
        
        const client = createClient();
        
        // Extract the cookies object passed to createServerClient
        const cookiesObj = (createServerClient as jest.Mock).mock.calls[0][2].cookies;
        
        // Test the remove method
        cookiesObj.remove('test-cookie', { path: '/' });
        
        // The mock set function should be called with the right arguments
        expect(mockSet).toHaveBeenCalledWith('test-cookie', '', { path: '/', maxAge: 0 });
        
        // Clear the mock
        jest.dontMock('next/headers');
      });
      
      it('should handle cookie removal errors', () => {
        // Force an error when importing next/headers
        jest.mock('next/headers', () => {
          throw new Error('Cannot use headers in this context');
        }, { virtual: true });
        
        // Mock console.warn to avoid test output noise
        const originalWarn = console.warn;
        console.warn = jest.fn();
        
        const client = createClient();
        
        // Extract the cookies object passed to createServerClient
        const cookiesObj = (createServerClient as jest.Mock).mock.calls[0][2].cookies;
        
        // Test the remove method
        cookiesObj.remove('test-cookie', { path: '/' });
        
        // Warning should be logged
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('Warning: Unable to remove cookie'),
          expect.any(String)
        );
        
        // Restore console.warn
        console.warn = originalWarn;
        
        // Clear the mock
        jest.dontMock('next/headers');
      });
    });
  });
}); 