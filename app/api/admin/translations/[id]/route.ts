// Admin Individual Translation Management API
// Provides endpoints for managing specific translations in the admin panel

import { NextRequest, NextResponse } from 'next/server';
import { TranslationService } from '@/lib/services/translationService';
import { getCurrentUser } from '@/lib/auth';
import { Permission } from '@/lib/types';

/**
 * DELETE /api/admin/translations/[id]
 * Delete a specific translation (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin (only admins can delete translations)
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin permissions required.' },
        { status: 403 }
      );
    }

    const translationService = new TranslationService();
    
    try {
      const deletedTranslation = await translationService.deleteTranslation(resolvedParams.id);
      
      return NextResponse.json({
        message: 'Translation deleted successfully',
        translation: deletedTranslation
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Translation not found') {
        return NextResponse.json(
          { error: 'Translation not found' },
          { status: 404 }
        );
      }
      throw error;
    }

  } catch (error) {
    console.error('Admin translation DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}