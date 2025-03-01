import { hasPermission, isAdmin, isContentEditor, setUserRole, grantPermission, revokePermission } from '../permissions';
import { Permission } from '@/lib/types';
import { prisma } from '@/lib/db';

// Mock the Prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

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

  describe('grantPermission', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should add a permission to a user', async () => {
      const mockUser = {
        id: 'user1',
        permissions: [Permission.MANAGE_DOCUMENTS],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        permissions: [...mockUser.permissions, Permission.APPROVE_REGISTRATIONS],
      });

      await grantPermission('user1', Permission.APPROVE_REGISTRATIONS);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        select: { permissions: true },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: {
          permissions: {
            set: [Permission.MANAGE_DOCUMENTS, Permission.APPROVE_REGISTRATIONS],
          },
        },
      });
    });

    it('should not add a permission if the user already has it', async () => {
      const mockUser = {
        id: 'user1',
        permissions: [Permission.MANAGE_DOCUMENTS, Permission.APPROVE_REGISTRATIONS],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await grantPermission('user1', Permission.MANAGE_DOCUMENTS);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        select: { permissions: true },
      });

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(grantPermission('nonexistent', Permission.MANAGE_DOCUMENTS))
        .rejects.toThrow('User not found');
    });
  });

  describe('revokePermission', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should remove a permission from a user', async () => {
      const mockUser = {
        id: 'user1',
        permissions: [Permission.MANAGE_DOCUMENTS, Permission.APPROVE_REGISTRATIONS],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        permissions: [Permission.APPROVE_REGISTRATIONS],
      });

      await revokePermission('user1', Permission.MANAGE_DOCUMENTS);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        select: { permissions: true },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: {
          permissions: {
            set: [Permission.APPROVE_REGISTRATIONS],
          },
        },
      });
    });

    it('should not attempt to remove a permission the user does not have', async () => {
      const mockUser = {
        id: 'user1',
        permissions: [Permission.APPROVE_REGISTRATIONS],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await revokePermission('user1', Permission.MANAGE_DOCUMENTS);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        select: { permissions: true },
      });

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw an error if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(revokePermission('nonexistent', Permission.MANAGE_DOCUMENTS))
        .rejects.toThrow('User not found');
    });
  });

  describe('setUserRole', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update a user role to admin', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user1',
        role: 'admin',
      });

      await setUserRole('user1', 'admin');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { role: 'admin' },
      });
    });

    it('should update a user role to contentEditor', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user1',
        role: 'contentEditor',
      });

      await setUserRole('user1', 'contentEditor');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { role: 'contentEditor' },
      });
    });

    it('should update a user role to regular user', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user1',
        role: 'user',
      });

      await setUserRole('user1', 'user');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { role: 'user' },
      });
    });
  });
}); 