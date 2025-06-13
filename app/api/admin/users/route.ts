import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/index';
import { db } from '@/lib/db';
import { checkPermission } from '@/lib/utils/permissions';
import { Permission } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isAdmin: true,
        permissions: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userPermissions = (user.permissions as Permission[]) || [];
    const canManageUsers = 
      user.isAdmin ||
      checkPermission(userPermissions, Permission.MANAGE_DOCUMENTS) ||
      checkPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS);

    if (!canManageUsers) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch all users
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true,
        isVerifiedOwner: true,
        permissions: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format users for response
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      isAdmin: user.isAdmin || false,
      isVerifiedOwner: user.isVerifiedOwner || false,
      permissions: (user.permissions as string[]) || [],
      createdAt: user.createdAt?.toISOString() || new Date().toISOString()
    }));

    return NextResponse.json({ users: formattedUsers });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}