import { 
  signUp, 
  signIn, 
  signOut, 
  resetPassword, 
  updatePassword, 
  getUser, 
  requireAuth, 
  requireAdmin, 
  requireVerifiedOwner, 
  hasPermission,
  AuthUser 
} from '../auth';
import { createClient as createClientBrowser } from '@/lib/supabase/client';
import { createClient as createClientServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock the Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = {
  ...originalLocation,
  origin: 'https://example.com',
};

describe('Supabase Auth Module', () => {
  let mockClientAuth: any;
  let mockServerAuth: any;
  let mockServerFrom: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock browser client
    mockClientAuth = {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    };
    
    (createClientBrowser as jest.Mock).mockReturnValue({
      auth: mockClientAuth,
    });
    
    // Mock server client
    mockServerAuth = {
      getUser: jest.fn(),
    };
    
    mockServerFrom = jest.fn().mockReturnThis();
    
    (createClientServer as jest.Mock).mockResolvedValue({
      auth: mockServerAuth,
      from: mockServerFrom,
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    });
  });
  
  afterAll(() => {
    window.location = originalLocation;
  });
  
  describe('signUp', () => {
    it('should call Supabase signUp with correct parameters', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const userData = {
        name: 'Test User',
        buildingNumber: 'A1',
        apartmentNumber: '101',
        phoneNumber: '123456789',
        preferredLanguage: 'french',
      };
      
      mockClientAuth.signUp.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });
      
      const result = await signUp(email, password, userData);
      
      expect(createClientBrowser).toHaveBeenCalled();
      expect(mockClientAuth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            building_number: userData.buildingNumber,
            apartment_number: userData.apartmentNumber,
            phone_number: userData.phoneNumber,
            preferred_language: userData.preferredLanguage,
            is_verified_owner: false,
            role: 'user',
            is_admin: false,
          },
        },
      });
      
      expect(result).toEqual({
        data: { user: { id: '123' } },
        error: null,
      });
    });
    
    it('should handle signUp errors', async () => {
      const error = new Error('Sign up failed');
      mockClientAuth.signUp.mockResolvedValue({
        data: null,
        error,
      });
      
      const result = await signUp('test@example.com', 'password123', {});
      
      expect(result).toEqual({
        data: null,
        error,
      });
    });
  });
  
  describe('signIn', () => {
    it('should call Supabase signInWithPassword with correct parameters', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      mockClientAuth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });
      
      const result = await signIn(email, password);
      
      expect(createClientBrowser).toHaveBeenCalled();
      expect(mockClientAuth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
      
      expect(result).toEqual({
        data: { user: { id: '123' } },
        error: null,
      });
    });
    
    it('should handle signIn errors', async () => {
      const error = new Error('Sign in failed');
      mockClientAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error,
      });
      
      const result = await signIn('test@example.com', 'password123');
      
      expect(result).toEqual({
        data: null,
        error,
      });
    });
  });
  
  describe('signOut', () => {
    it('should call Supabase signOut', async () => {
      mockClientAuth.signOut.mockResolvedValue({
        error: null,
      });
      
      const result = await signOut();
      
      expect(createClientBrowser).toHaveBeenCalled();
      expect(mockClientAuth.signOut).toHaveBeenCalled();
      expect(result).toEqual({
        error: null,
      });
    });
    
    it('should handle signOut errors', async () => {
      const error = new Error('Sign out failed');
      mockClientAuth.signOut.mockResolvedValue({
        error,
      });
      
      const result = await signOut();
      
      expect(result).toEqual({
        error,
      });
    });
  });
  
  describe('resetPassword', () => {
    it('should call Supabase resetPasswordForEmail with correct parameters', async () => {
      const email = 'test@example.com';
      
      mockClientAuth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });
      
      const result = await resetPassword(email);
      
      expect(createClientBrowser).toHaveBeenCalled();
      expect(mockClientAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        email,
        { redirectTo: 'https://example.com/auth/reset-password' }
      );
      
      expect(result).toEqual({
        data: {},
        error: null,
      });
    });
    
    it('should handle resetPassword errors', async () => {
      const error = new Error('Reset password failed');
      mockClientAuth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error,
      });
      
      const result = await resetPassword('test@example.com');
      
      expect(result).toEqual({
        data: null,
        error,
      });
    });
  });
  
  describe('updatePassword', () => {
    it('should call Supabase updateUser with correct parameters', async () => {
      const password = 'newpassword123';
      
      mockClientAuth.updateUser.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });
      
      const result = await updatePassword(password);
      
      expect(createClientBrowser).toHaveBeenCalled();
      expect(mockClientAuth.updateUser).toHaveBeenCalledWith({
        password,
      });
      
      expect(result).toEqual({
        data: { user: { id: '123' } },
        error: null,
      });
    });
    
    it('should handle updatePassword errors', async () => {
      const error = new Error('Update password failed');
      mockClientAuth.updateUser.mockResolvedValue({
        data: null,
        error,
      });
      
      const result = await updatePassword('newpassword123');
      
      expect(result).toEqual({
        data: null,
        error,
      });
    });
  });
  
  describe('getUser', () => {
    it('should return user data when authentication and database query succeed', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockUserData = {
        id: '123',
        name: 'Test User',
        isAdmin: false,
        isVerifiedOwner: false,
      };
      
      mockServerAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
      
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUserData,
        error: null,
      });
      
      (createClientServer as jest.Mock).mockResolvedValue({
        auth: mockServerAuth,
        from: jest.fn().mockReturnValue({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        }),
      });
      
      const result = await getUser();
      
      expect(createClientServer).toHaveBeenCalled();
      expect(mockServerAuth.getUser).toHaveBeenCalled();
      expect(result).toEqual({
        ...mockUserData,
        email: mockUser.email,
      });
    });
    
    it('should return null when user is not authenticated', async () => {
      mockServerAuth.getUser.mockResolvedValue({
        data: { user: null },
      });
      
      const result = await getUser();
      
      expect(result).toBeNull();
    });
    
    it('should return null when database query fails', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      
      mockServerAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
      
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database query failed'),
      });
      
      (createClientServer as jest.Mock).mockResolvedValue({
        auth: mockServerAuth,
        from: jest.fn().mockReturnValue({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        }),
      });
      
      const result = await getUser();
      
      expect(result).toBeNull();
    });
  });
  
  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser: AuthUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
        isVerifiedOwner: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(mockUser);
      
      const result = await requireAuth();
      
      expect(result).toEqual(mockUser);
      expect(redirect).not.toHaveBeenCalled();
    });
    
    it('should redirect to signin page when not authenticated', async () => {
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(null);
      
      await requireAuth();
      
      expect(redirect).toHaveBeenCalledWith('/auth/signin');
    });
  });
  
  describe('requireAdmin', () => {
    it('should return user when authenticated as admin', async () => {
      const mockUser: AuthUser = {
        id: '123',
        email: 'admin@example.com',
        name: 'Admin User',
        isAdmin: true,
        isVerifiedOwner: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(mockUser);
      
      const result = await requireAdmin();
      
      expect(result).toEqual(mockUser);
      expect(redirect).not.toHaveBeenCalled();
    });
    
    it('should redirect to home page when not admin', async () => {
      const mockUser: AuthUser = {
        id: '123',
        email: 'user@example.com',
        name: 'Regular User',
        isAdmin: false,
        isVerifiedOwner: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(mockUser);
      
      await requireAdmin();
      
      expect(redirect).toHaveBeenCalledWith('/');
    });
    
    it('should redirect to home page when not authenticated', async () => {
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(null);
      
      await requireAdmin();
      
      expect(redirect).toHaveBeenCalledWith('/');
    });
  });
  
  describe('requireVerifiedOwner', () => {
    it('should return user when authenticated as verified owner', async () => {
      const mockUser: AuthUser = {
        id: '123',
        email: 'owner@example.com',
        name: 'Owner User',
        isAdmin: false,
        isVerifiedOwner: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(mockUser);
      
      const result = await requireVerifiedOwner();
      
      expect(result).toEqual(mockUser);
      expect(redirect).not.toHaveBeenCalled();
    });
    
    it('should redirect to home page when not a verified owner', async () => {
      const mockUser: AuthUser = {
        id: '123',
        email: 'user@example.com',
        name: 'Regular User',
        isAdmin: false,
        isVerifiedOwner: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(mockUser);
      
      await requireVerifiedOwner();
      
      expect(redirect).toHaveBeenCalledWith('/');
    });
    
    it('should redirect to home page when not authenticated', async () => {
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(null);
      
      await requireVerifiedOwner();
      
      expect(redirect).toHaveBeenCalledWith('/');
    });
  });
  
  describe('hasPermission', () => {
    it('should return true when user has the required permission', async () => {
      const mockUser: AuthUser = {
        id: '123',
        email: 'user@example.com',
        name: 'User',
        isAdmin: false,
        isVerifiedOwner: true,
        permissions: ['manageDocuments', 'viewComiteDocuments'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(mockUser);
      
      const result = await hasPermission('manageDocuments');
      
      expect(result).toBe(true);
    });
    
    it('should return false when user does not have the required permission', async () => {
      const mockUser: AuthUser = {
        id: '123',
        email: 'user@example.com',
        name: 'User',
        isAdmin: false,
        isVerifiedOwner: true,
        permissions: ['viewComiteDocuments'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(mockUser);
      
      const result = await hasPermission('manageDocuments');
      
      expect(result).toBe(false);
    });
    
    it('should return false when user has no permissions', async () => {
      const mockUser: AuthUser = {
        id: '123',
        email: 'user@example.com',
        name: 'User',
        isAdmin: false,
        isVerifiedOwner: true,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(mockUser);
      
      const result = await hasPermission('manageDocuments');
      
      expect(result).toBe(false);
    });
    
    it('should return false when not authenticated', async () => {
      jest.spyOn(global, 'getUser').mockResolvedValueOnce(null);
      
      const result = await hasPermission('manageDocuments');
      
      expect(result).toBe(false);
    });
  });
}); 