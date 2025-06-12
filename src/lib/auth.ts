// Authentication utility functions
// Simplified implementation for TDD development

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

/**
 * Get current authenticated user
 * In production, this would check JWT tokens, sessions, etc.
 */
export async function getCurrentUser(): Promise<User | null> {
  // For TDD development, return mock user
  // In production, this would integrate with your auth system (Clerk, NextAuth, etc.)
  
  if (process.env.NODE_ENV === 'test') {
    // Return null in tests to allow mocking
    return null;
  }

  // Mock user for development
  return {
    id: 'user-123',
    email: 'test@example.com',
    role: 'user',
    name: 'Test User',
  };
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: User, permission: string): boolean {
  // Admin has all permissions
  if (user.role === 'admin') {
    return true;
  }

  // ContentEditor has translation permissions
  if (user.role === 'contentEditor' && permission.includes('translation')) {
    return true;
  }

  // Regular users can request translations
  if (permission === 'request_translation') {
    return true;
  }

  return false;
}

/**
 * Require authentication middleware
 */
export function requireAuth() {
  return async (user: User | null) => {
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  };
}

/**
 * Require specific permission middleware
 */
export function requirePermission(permission: string) {
  return async (user: User | null) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    if (!hasPermission(user, permission)) {
      throw new Error('Insufficient permissions');
    }

    return user;
  };
}