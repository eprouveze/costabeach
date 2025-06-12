import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/index';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Test auth endpoint called');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          hasSession: false
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      hasSession: true,
      user: {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
        isAdmin: session.user?.isAdmin
      }
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Make current user an admin and give WhatsApp permissions
    const updatedUser = await db.user.upsert({
      where: { email: session.user.email },
      update: {
        is_admin: true,
        permissions: ['manageDocuments', 'manageComiteDocuments'],
        role: 'admin'
      },
      create: {
        email: session.user.email,
        name: session.user.name || 'Admin User',
        is_admin: true,
        permissions: ['manageDocuments', 'manageComiteDocuments'],
        role: 'admin'
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: 'User updated with admin privileges'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}