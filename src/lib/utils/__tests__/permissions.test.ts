import { hasPermission, isAdmin, isContentEditor } from '../permissions';
import { Permission } from '@/lib/types';

describe('Permission Utilities', () => {
  describe('hasPermission', () => {
    it('should return true if user has the required permission', () => {
      const userPermissions = [
        Permission.MANAGE_DOCUMENTS,
        Permission.APPROVE_REGISTRATIONS,
        Permission.MANAGE_COMITE_DOCUMENTS
      ];
      
      expect(hasPermission(userPermissions, Permission.MANAGE_DOCUMENTS)).toBe(true);
      expect(hasPermission(userPermissions, Permission.APPROVE_REGISTRATIONS)).toBe(true);
      expect(hasPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS)).toBe(true);
    });
    
    it('should return false if user does not have the required permission', () => {
      const userPermissions = [
        Permission.MANAGE_DOCUMENTS,
        Permission.APPROVE_REGISTRATIONS
      ];
      
      expect(hasPermission(userPermissions, Permission.MANAGE_LEGAL_DOCUMENTS)).toBe(false);
      expect(hasPermission(userPermissions, Permission.MANAGE_SOCIETE_DOCUMENTS)).toBe(false);
    });
    
    it('should return false for empty permissions array', () => {
      const userPermissions: string[] = [];
      
      expect(hasPermission(userPermissions, Permission.MANAGE_DOCUMENTS)).toBe(false);
    });
    
    it('should handle undefined permissions array', () => {
      const userPermissions = undefined;
      
      expect(hasPermission(userPermissions, Permission.MANAGE_DOCUMENTS)).toBe(false);
    });
  });
  
  describe('isAdmin', () => {
    it('should return true if user role is admin', () => {
      expect(isAdmin('admin')).toBe(true);
    });
    
    it('should return false if user role is not admin', () => {
      expect(isAdmin('user')).toBe(false);
      expect(isAdmin('contentEditor')).toBe(false);
      expect(isAdmin('')).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
    });
  });
  
  describe('isContentEditor', () => {
    it('should return true if user role is contentEditor', () => {
      expect(isContentEditor('contentEditor')).toBe(true);
    });
    
    it('should return true if user role is admin', () => {
      expect(isContentEditor('admin')).toBe(true);
    });
    
    it('should return false if user role is not contentEditor or admin', () => {
      expect(isContentEditor('user')).toBe(false);
      expect(isContentEditor('')).toBe(false);
      expect(isContentEditor(undefined)).toBe(false);
    });
  });
}); 