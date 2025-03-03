import { renderHook, act } from '@testing-library/react-hooks';
import { useSupabaseSession, useSupabaseUser } from '../hooks';
import { createClient } from '@/lib/supabase/client';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

describe('Supabase Hooks', () => {
  let mockAuth: any;
  let mockSubscription: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock subscription unsubscribe function
    mockSubscription = { unsubscribe: jest.fn() };
    
    // Mock auth methods
    mockAuth = {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: mockSubscription },
      }),
    };
    
    (createClient as jest.Mock).mockReturnValue({
      auth: mockAuth,
    });
  });

  describe('useSupabaseSession', () => {
    it('should initialize with loading state and null session', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useSupabaseSession());
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      
      await waitForNextUpdate();
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should fetch session on initial render', async () => {
      const mockSession = { user: { id: '123', email: 'test@example.com' } };
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useSupabaseSession());
      
      expect(result.current.isLoading).toBe(true);
      
      await waitForNextUpdate();
      
      expect(createClient).toHaveBeenCalled();
      expect(mockAuth.getSession).toHaveBeenCalled();
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockSession.user);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set up an auth state change listener', async () => {
      const { waitForNextUpdate } = renderHook(() => useSupabaseSession());
      
      await waitForNextUpdate();
      
      expect(mockAuth.onAuthStateChange).toHaveBeenCalled();
    });

    it('should update session on auth state change', async () => {
      const mockSession = { user: { id: '123', email: 'test@example.com' } };
      
      const { result, waitForNextUpdate } = renderHook(() => useSupabaseSession());
      
      await waitForNextUpdate();
      
      // Simulate auth state change
      const authStateChangeHandler = mockAuth.onAuthStateChange.mock.calls[0][0];
      act(() => {
        authStateChangeHandler('SIGNED_IN', mockSession);
      });
      
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockSession.user);
      expect(result.current.isLoading).toBe(false);
    });

    it('should clean up subscription on unmount', async () => {
      const { unmount, waitForNextUpdate } = renderHook(() => useSupabaseSession());
      
      await waitForNextUpdate();
      
      unmount();
      
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should refresh session when refresh function is called', async () => {
      const initialSession = { user: { id: '123', email: 'test@example.com' } };
      const updatedSession = { user: { id: '123', email: 'updated@example.com' } };
      
      mockAuth.getSession
        .mockResolvedValueOnce({ data: { session: initialSession } })
        .mockResolvedValueOnce({ data: { session: updatedSession } });
      
      const { result, waitForNextUpdate } = renderHook(() => useSupabaseSession());
      
      await waitForNextUpdate();
      
      expect(result.current.session).toEqual(initialSession);
      
      // Call refresh function
      act(() => {
        result.current.refresh();
      });
      
      // Need to wait for the async refresh to complete
      await waitForNextUpdate();
      
      expect(mockAuth.getSession).toHaveBeenCalledTimes(2);
      expect(result.current.session).toEqual(updatedSession);
    });

    it('should handle errors when refreshing session', async () => {
      // Mock console.error to prevent error output in tests
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      mockAuth.getSession
        .mockResolvedValueOnce({ data: { session: null } })
        .mockRejectedValueOnce(new Error('Failed to refresh session'));
      
      const { result, waitForNextUpdate } = renderHook(() => useSupabaseSession());
      
      await waitForNextUpdate();
      
      // Call refresh function
      act(() => {
        result.current.refresh();
      });
      
      // Need to wait for the async refresh to complete
      await waitForNextUpdate();
      
      expect(console.error).toHaveBeenCalledWith(
        'Error getting session:',
        expect.any(Error)
      );
      expect(result.current.isLoading).toBe(false);
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('useSupabaseUser', () => {
    it('should return user from session', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: mockUser } },
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useSupabaseUser());
      
      expect(result.current.isLoading).toBe(true);
      
      await waitForNextUpdate();
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return null user when not authenticated', async () => {
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });
      
      const { result, waitForNextUpdate } = renderHook(() => useSupabaseUser());
      
      await waitForNextUpdate();
      
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });
}); 