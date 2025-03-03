import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../LoginForm';
import { signIn } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useI18n } from '@/lib/i18n/client';

// Mock dependencies
jest.mock('@/lib/supabase/auth', () => ({
  signIn: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('@/lib/i18n/client', () => ({
  useI18n: jest.fn(),
}));

describe('LoginForm', () => {
  // Setup common mocks
  const mockRouter = {
    push: jest.fn(),
  };
  const mockSearchParams = {
    get: jest.fn(),
  };
  const mockSupabase = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }),
  };
  const mockT = jest.fn((key) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (useI18n as jest.Mock).mockReturnValue({ t: mockT, locale: 'fr' });
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/fr/auth/signin',
        href: 'http://localhost:3000/fr/auth/signin',
      },
      writable: true,
    });
  });

  it('renders the login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/auth.signin.email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/auth.signin.password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auth.signin.submit/i })).toBeInTheDocument();
  });

  it('handles form submission with valid credentials', async () => {
    const mockSession = {
      user: { id: 'user-123' },
    };
    
    (signIn as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    mockSupabase.from().single.mockResolvedValue({
      data: { 
        role: 'user',
        is_verified_owner: true
      },
      error: null,
    });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/auth.signin.email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/auth.signin.password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.submit(screen.getByRole('button', { name: /auth.signin.submit/i }));
    
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(toast.success).toHaveBeenCalledWith('auth.signin.success');
    });
  });

  it('redirects verified owners to the owner dashboard', async () => {
    const mockSession = {
      user: { id: 'user-123' },
    };
    
    (signIn as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    mockSupabase.from().single.mockResolvedValue({
      data: { 
        role: 'user',
        is_verified_owner: true
      },
      error: null,
    });

    // Mock window.location.href setter
    const hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/fr/auth/signin',
        get href() {
          return 'http://localhost:3000/fr/auth/signin';
        },
        set href(value) {
          hrefSetter(value);
        },
      },
      writable: true,
    });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/auth.signin.email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/auth.signin.password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.submit(screen.getByRole('button', { name: /auth.signin.submit/i }));
    
    await waitFor(() => {
      expect(hrefSetter).toHaveBeenCalledWith('/fr/owner-dashboard');
    });
  });

  it('redirects admins to the admin dashboard', async () => {
    const mockSession = {
      user: { id: 'user-123' },
    };
    
    (signIn as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    mockSupabase.from().single.mockResolvedValue({
      data: { 
        role: 'admin',
        is_verified_owner: false
      },
      error: null,
    });

    // Mock window.location.href setter
    const hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/fr/auth/signin',
        get href() {
          return 'http://localhost:3000/fr/auth/signin';
        },
        set href(value) {
          hrefSetter(value);
        },
      },
      writable: true,
    });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/auth.signin.email/i), {
      target: { value: 'admin@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/auth.signin.password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.submit(screen.getByRole('button', { name: /auth.signin.submit/i }));
    
    await waitFor(() => {
      expect(hrefSetter).toHaveBeenCalledWith('/fr/admin');
    });
  });

  it('redirects to returnUrl if provided', async () => {
    const mockSession = {
      user: { id: 'user-123' },
    };
    
    (signIn as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    mockSupabase.from().single.mockResolvedValue({
      data: { 
        role: 'user',
        is_verified_owner: false
      },
      error: null,
    });

    mockSearchParams.get.mockReturnValue('/fr/some-return-url');

    // Mock window.location.href setter
    const hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/fr/auth/signin',
        get href() {
          return 'http://localhost:3000/fr/auth/signin?returnUrl=/fr/some-return-url';
        },
        set href(value) {
          hrefSetter(value);
        },
      },
      writable: true,
    });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/auth.signin.email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/auth.signin.password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.submit(screen.getByRole('button', { name: /auth.signin.submit/i }));
    
    await waitFor(() => {
      expect(hrefSetter).toHaveBeenCalledWith('/fr/some-return-url');
    });
  });

  it('handles authentication errors', async () => {
    (signIn as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/auth.signin.email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/auth.signin.password/i), {
      target: { value: 'wrong-password' },
    });
    
    fireEvent.submit(screen.getByRole('button', { name: /auth.signin.submit/i }));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid login credentials');
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
    });
  });

  it('handles user data fetching errors', async () => {
    const mockSession = {
      user: { id: 'user-123' },
    };
    
    (signIn as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    mockSupabase.from().single.mockResolvedValue({
      data: null,
      error: { message: 'Error fetching user data' },
    });

    // Mock window.location.href setter
    const hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/fr/auth/signin',
        get href() {
          return 'http://localhost:3000/fr/auth/signin';
        },
        set href(value) {
          hrefSetter(value);
        },
      },
      writable: true,
    });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/auth.signin.email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/auth.signin.password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.submit(screen.getByRole('button', { name: /auth.signin.submit/i }));
    
    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith('Could not fetch complete user profile, redirecting to home page');
      expect(hrefSetter).toHaveBeenCalledWith('/fr');
    });
  });
}); 