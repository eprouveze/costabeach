import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/index';
import { db } from '@/lib/db';
import { checkPermission } from '@/lib/utils/permissions';
import { Permission } from '@/lib/types';
import { createAuditLog } from '@/lib/utils/audit';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isAdmin: true,
        permissions: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userPermissions = (currentUser.permissions as Permission[]) || [];
    const canManageUsers = 
      currentUser.isAdmin ||
  checkPermission(userPermissions, Permission.MANAGE_USERS);

    if (!canManageUsers) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { userId } = await params;
    const body = await req.json();
    const { role, isAdmin, isVerifiedOwner, isActive, permissions } = body;

    // Find the user to update
    const targetUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Prevent non-admins from making other users admins
    if (isAdmin && !currentUser.isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can grant admin privileges' },
        { status: 403 }
      );
    }

    // Prevent users from modifying themselves (to avoid lockout)
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account through this endpoint' },
        { status: 400 }
      );
    }

    // Track changes for audit log
    const changes: Record<string, { from: any; to: any }> = {};
    if (role !== undefined && role !== targetUser.role) {
      changes.role = { from: targetUser.role, to: role };
    }
    if (isAdmin !== undefined && isAdmin !== targetUser.isAdmin) {
      changes.isAdmin = { from: targetUser.isAdmin, to: isAdmin };
    }
    if (isVerifiedOwner !== undefined && isVerifiedOwner !== targetUser.isVerifiedOwner) {
      changes.isVerifiedOwner = { from: targetUser.isVerifiedOwner, to: isVerifiedOwner };
    }
    if (isActive !== undefined && isActive !== targetUser.isActive) {
      changes.isActive = { from: targetUser.isActive, to: isActive };
    }
    if (permissions !== undefined && JSON.stringify(permissions) !== JSON.stringify(targetUser.permissions)) {
      changes.permissions = { from: targetUser.permissions, to: permissions };
    }

    // Update the user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role: role || targetUser.role,
        isAdmin: isAdmin !== undefined ? isAdmin : targetUser.isAdmin,
        isVerifiedOwner: isVerifiedOwner !== undefined ? isVerifiedOwner : targetUser.isVerifiedOwner,
        isActive: isActive !== undefined ? isActive : targetUser.isActive,
        permissions: permissions !== undefined ? permissions : targetUser.permissions,
        updatedAt: new Date()
      }
    });

    // Create audit log for user modification
    if (Object.keys(changes).length > 0) {
      try {
        await createAuditLog(
          session.user.id,
          'update',
          'User',
          userId,
          {
            targetUser: {
              email: targetUser.email,
              name: targetUser.name
            },
            changes
          }
        );
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError);
        // Continue execution - don't fail the request due to audit logging issues
      }
    }

    // Format response
    const formattedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role || 'user',
      isAdmin: updatedUser.isAdmin,
      isVerifiedOwner: updatedUser.isVerifiedOwner,
      permissions: (updatedUser.permissions as string[]) || [],
      createdAt: updatedUser.createdAt.toISOString(),
      lastLogin: updatedUser.lastLogin?.toISOString(),
      isActive: updatedUser.isActive !== false
    };

    return NextResponse.json(formattedUser);

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}