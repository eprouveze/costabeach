// Admin Translation Management API
// Provides endpoints for managing translations in the admin panel

import { NextRequest, NextResponse } from 'next/server';
import { TranslationService } from '@/lib/services/translationService';
import { getCurrentUser } from '@/lib/auth';
import { Permission } from '@/lib/types';

/**
 * GET /api/admin/translations
 * Get translation statistics and orphaned translations
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin permissions required.' },
        { status: 403 }
      );
    }

    const translationService = new TranslationService();
    
    // Get statistics and orphaned translations
    const [stats, orphanedTranslations] = await Promise.all([
      translationService.getTranslationStats(),
      translationService.getOrphanedTranslations()
    ]);

    return NextResponse.json({
      stats,
      orphanedTranslations,
      orphanedCount: orphanedTranslations.length
    });

  } catch (error) {
    console.error('Admin translations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/translations
 * Cleanup orphaned translations
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin permissions required.' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    const translationService = new TranslationService();

    if (action === 'cleanup-orphaned') {
      // Cleanup all orphaned translations
      const result = await translationService.cleanupOrphanedTranslations();
      
      return NextResponse.json({
        message: `Successfully cleaned up ${result.count} orphaned translation(s)`,
        count: result.count,
        deletedIds: result.deletedIds
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=cleanup-orphaned' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Admin translations DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}