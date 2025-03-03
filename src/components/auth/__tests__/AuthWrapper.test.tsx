import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthWrapper } from '../AuthWrapper';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('AuthWrapper', () => {
  // Setup common mocks
  const mockRouter = {
    push: jest.fn(),
  };
  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/fr/owner-dashboard');
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('renders children when no authentication is required', async () => {
    render(
      <AuthWrapper>
        <div data-testid="test-child">Test Child</div>
      </AuthWrapper>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(mockSupabase.auth.getSession).not.toHaveBeenCalled();
  });

  it('shows loading state when authentication is required and loading', async () => {
    // Don't resolve the getSession promise yet to keep loading state
    mockSupabase.auth.getSession.mockReturnValue(new Promise(() => {}));

    render(
      <AuthWrapper requireAuth>
        <div data-testid="test-child">Test Child</div>
      </AuthWrapper>
    );

    expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to signin when not authenticated and authentication is required', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <AuthWrapper requireAuth>
        <div data-testid="test-child">Test Child</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/fr/auth/signin?returnUrl=%2Ffr%2Fowner-dashboard');
    });
  });

  it('renders children when authenticated and authentication is required', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    mockSupabase.from().single.mockResolvedValue({
      data: { 
        id: 'user-123', 
        email: 'test@example.com', 
        role: 'user',
        is_verified_owner: true
      },
      error: null,
    });

    render(
      <AuthWrapper requireAuth>
        <div data-testid="test-child">Test Child</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  it('creates a new user record when user exists in auth but not in database', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // First query returns error (user not found)
    mockSupabase.from().single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    });

    // getUser call
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          id: 'user-123', 
          email: 'test@example.com',
          user_metadata: { name: 'Test User' }
        } 
      },
      error: null,
    });

    // Insert query returns the new user
    mockSupabase.from().insert.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { 
          id: 'user-123', 
          email: 'test@example.com', 
          role: 'user',
          is_verified_owner: false
        },
        error: null,
      }),
    });

    render(
      <AuthWrapper requireAuth>
        <div data-testid="test-child">Test Child</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(mockSupabase.from().insert).toHaveBeenCalled();
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  it('redirects non-verified owners away from owner dashboard', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    mockSupabase.from().single.mockResolvedValue({
      data: { 
        id: 'user-123', 
        email: 'test@example.com', 
        role: 'user',
        is_verified_owner: false
      },
      error: null,
    });

    render(
      <AuthWrapper requireAuth>
        <div data-testid="test-child">Test Child</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("You need to be a verified owner to access the owner dashboard");
      expect(mockRouter.push).toHaveBeenCalledWith('/fr');
    });
  });

  it('redirects users without required roles', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    mockSupabase.from().single.mockResolvedValue({
      data: { 
        id: 'user-123', 
        email: 'test@example.com', 
        role: 'user',
        is_verified_owner: true
      },
      error: null,
    });

    // Mock a non-owner dashboard path to avoid the owner verification check
    (usePathname as jest.Mock).mockReturnValue('/fr/admin');

    render(
      <AuthWrapper requireAuth allowedRoles={['admin']}>
        <div data-testid="test-child">Test Child</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/fr');
    });
  });
}); 