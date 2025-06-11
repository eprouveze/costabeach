import { prisma } from '@/lib/db';
import { Permission } from '@/lib/types';

/**
 * Check if a user has a specific permission
 * @param userPermissions Array of user permissions
 * @param requiredPermission The permission to check for
 * @returns Boolean indicating if the user has the permission
 */
export function checkPermission(
  userPermissions: Permission[] | undefined,
  requiredPermission: Permission
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if a user has any of the specified permissions
 * @param userPermissions Array of user permissions
 * @param requiredPermissions Array of permissions to check for
 * @returns Boolean indicating if the user has any of the permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[] | undefined,
  requiredPermissions: Permission[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if a user has all of the specified permissions
 * @param userPermissions Array of user permissions
 * @param requiredPermissions Array of permissions to check for
 * @returns Boolean indicating if the user has all of the permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[] | undefined,
  requiredPermissions: Permission[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

/**
 * Check if a user is an admin
 */
export const isAdmin = (role: string): boolean => {
  return role === 'admin';
};

/**
 * Check if a user is a content editor
 */
export const isContentEditor = (role: string): boolean => {
  return role === 'contentEditor' || role === 'admin';
};

/**
 * Grant a permission to a user
 */
export const grantPermission = async (
  userId: string,
  permission: Permission
): Promise<void> => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { permissions: true },
  });
  
  if (!user) throw new Error('User not found');
  
  const currentPermissions = user.permissions || [];
  
  if (!currentPermissions.includes(permission)) {
    await prisma.users.update({
      where: { id: userId },
      data: {
        permissions: {
          set: [...currentPermissions, permission],
        },
      },
    });
  }
};

/**
 * Revoke a permission from a user
 */
export const revokePermission = async (
  userId: string,
  permission: Permission
): Promise<void> => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { permissions: true },
  });
  
  if (!user) throw new Error('User not found');
  
  const currentPermissions = user.permissions || [];
  
  if (currentPermissions.includes(permission)) {
    await prisma.users.update({
      where: { id: userId },
      data: {
        permissions: {
          set: currentPermissions.filter(p => p !== permission),
        },
      },
    });
  }
};

/**
 * Set a user's role
 */
export const setUserRole = async (
  userId: string,
  role: 'user' | 'admin' | 'contentEditor'
): Promise<void> => {
  await prisma.users.update({
    where: { id: userId },
    data: { role },
  });
};

/**
 * Get all users with a specific permission
 */
export const getUsersWithPermission = async (
  permission: Permission
): Promise<{ id: string; name: string | null; email: string | null }[]> => {
  return prisma.users.findMany({
    where: {
      permissions: {
        has: permission,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}; 