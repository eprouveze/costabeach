import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/index';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log('Permissions API called for user:', userId);
    
    // Get the current session
    const session = await getServerSession(authOptions);
    console.log('Session in permissions API:', { 
      hasSession: !!session, 
      userId: session?.user?.id 
    });
    
    if (!session?.user?.id) {
      console.log('No session or user ID in permissions API');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('Fetching permissions for userId:', userId);
    
    // Only allow users to access their own permissions, or admins to access any user's permissions
    if (session.user.id !== userId && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get user from database
    console.log('Querying database for user:', userId);
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        permissions: true,
        isAdmin: true,
        role: true
      }
    });

    console.log('Database query result:', { 
      found: !!user, 
      userId: user?.id,
      permissions: user?.permissions 
    });

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse the name field to get first and last names
    const nameParts = user.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const result = {
      id: user.id,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
      permissions: user.permissions || [],
      isAdmin: user.isAdmin || false,
      role: user.role || 'user'
    };

    console.log('Returning permissions data:', result);
    
    // Return user data with permissions
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching user permissions:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}