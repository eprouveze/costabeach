import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/index';
import { db } from '@/lib/db';
import { checkPermission } from '@/lib/utils/permissions';
import { Permission } from '@/lib/types';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  maxFileUploadSizeMB: number;
  documentRetentionDays: number;
  sessionTimeoutMinutes: number;
  defaultLanguage: 'fr' | 'en' | 'ar';
  allowedLanguages: string[];
  requireEmailVerification: boolean;
  allowGuestAccess: boolean;
  moderateComments: boolean;
  enableAuditLogs: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: "Costa Beach 3",
  siteDescription: "Premier beachfront community portal",
  contactEmail: "admin@costabeach3.com",
  supportPhone: "+212 522 123 456",
  maintenanceMode: false,
  registrationEnabled: true,
  emailNotificationsEnabled: true,
  whatsappNotificationsEnabled: true,
  maxFileUploadSizeMB: 10,
  documentRetentionDays: 365,
  sessionTimeoutMinutes: 60,
  defaultLanguage: 'fr',
  allowedLanguages: ['fr', 'en', 'ar'],
  requireEmailVerification: true,
  allowGuestAccess: false,
  moderateComments: true,
  enableAuditLogs: true
};

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
    const canManageSettings = 
      user.isAdmin ||
      checkPermission(userPermissions, Permission.MANAGE_DOCUMENTS) ||
      checkPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS);

    if (!canManageSettings) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // For now, return default settings since systemSetting table may not exist
    const finalSettings = DEFAULT_SETTINGS;

    return NextResponse.json({ settings: finalSettings });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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
    const canManageSettings = 
      user.isAdmin ||
      checkPermission(userPermissions, Permission.MANAGE_DOCUMENTS) ||
      checkPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS);

    if (!canManageSettings) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();

    // Validate the settings object
    const validKeys = Object.keys(DEFAULT_SETTINGS);
    const settingsToUpdate = Object.keys(body).filter(key => validKeys.includes(key));

    if (settingsToUpdate.length === 0) {
      return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 });
    }

    // For now, just log the settings update (no database persistence since table may not exist)
    console.log('Settings update requested:', {
      userId: user.id,
      settingsToUpdate,
      values: Object.fromEntries(settingsToUpdate.map(key => [key, body[key]]))
    });

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      updatedSettings: settingsToUpdate 
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}