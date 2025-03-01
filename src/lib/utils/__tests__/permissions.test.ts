import { hasPermission, isAdmin, isContentEditor } from '../permissions';
import { Permission } from '@/lib/types';

describe('Permission Utilities', () => {
  describe('hasPermission', () => {
    it('should return true if user has the required permission', () => {
      const userPermissions = [Permission.MANAGE_DOCUMENTS, Permission.APPROVE_REGISTRATIONS];
      
      expect(hasPermission(userPermissions, Permission.MANAGE_DOCUMENTS)).toBe(true);
    });
    
    it('should return false if user does not have the required permission', () => {
      const userPermissions = [Permission.APPROVE_REGISTRATIONS];
      
      expect(hasPermission(userPermissions, Permission.MANAGE_DOCUMENTS)).toBe(false);
    });
    
    it('should return false for empty permissions array', () => {
      const userPermissions: Permission[] = [];
      
      expect(hasPermission(userPermissions, Permission.MANAGE_DOCUMENTS)).toBe(false);
    });
    
    it('should return false for undefined permissions', () => {
      expect(hasPermission(undefined, Permission.MANAGE_DOCUMENTS)).toBe(false);
    });
  });
  
  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin('admin')).toBe(true);
    });
    
    it('should return false for non-admin roles', () => {
      expect(isAdmin('user')).toBe(false);
      expect(isAdmin('contentEditor')).toBe(false);
    });
    
    it('should handle null or undefined roles', () => {
      expect(isAdmin(null as unknown as string)).toBe(false);
      expect(isAdmin(undefined as unknown as string)).toBe(false);
    });
  });
  
  describe('isContentEditor', () => {
    it('should return true for contentEditor role', () => {
      expect(isContentEditor('contentEditor')).toBe(true);
    });
    
    it('should return true for admin role (admins are also content editors)', () => {
      expect(isContentEditor('admin')).toBe(true);
    });
    
    it('should return false for other roles', () => {
      expect(isContentEditor('user')).toBe(false);
    });
    
    it('should handle null or undefined roles', () => {
      expect(isContentEditor(null as unknown as string)).toBe(false);
      expect(isContentEditor(undefined as unknown as string)).toBe(false);
    });
  });
}); 