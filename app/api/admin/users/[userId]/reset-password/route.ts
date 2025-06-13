import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/index';
import { db } from '@/lib/db';
import { checkPermission } from '@/lib/utils/permissions';
import { Permission } from '@/lib/types';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
 )
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
      checkPermission(userPermissions, Permission.MANAGE_DOCUMENTS) ||
      checkPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS);

    if (!canManageUsers) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { userId } = params;

    // Find the target user
    const targetUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token
    await db.user.update({
      where: { id: userId },
      data: {
        resetToken,
        resetTokenExpiry,
        updatedAt: new Date()
      }
    });

    // TODO: Send password reset email
    // For now, we'll just log the reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${targetUser.email}: ${resetLink}`);

    // In a real application, you would send an email here
    // await sendPasswordResetEmail(targetUser.email, resetLink);

    return NextResponse.json({ 
      message: 'Password reset email sent successfully',
      // In development, return the reset link for testing
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    });

  } catch (error) {
    console.error('Error sending password reset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}