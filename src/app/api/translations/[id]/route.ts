// Individual Translation Management API
// RESTful endpoints for managing specific translations

import { NextRequest, NextResponse } from 'next/server';
import { TranslationService } from '@/lib/services/translationService';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/translations/[id]
 * Get specific translation details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const translationService = new TranslationService();
    const translation = await translationService.getTranslationById(params.id);

    if (!translation) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this translation
    if (translation.requested_by !== user.id && user.role !== 'admin' && user.role !== 'contentEditor') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ translation });

  } catch (error) {
    console.error('Translation GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/translations/[id]
 * Update translation (add feedback, cancel, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const translationService = new TranslationService();

    // Get translation to check ownership
    const translation = await translationService.getTranslationById(params.id);
    if (!translation) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (translation.requested_by !== user.id && user.role !== 'admin' && user.role !== 'contentEditor') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Handle different update types
    if (body.action === 'add_feedback') {
      if (!body.rating || typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
        return NextResponse.json(
          { error: 'Invalid rating. Must be between 1 and 5' },
          { status: 400 }
        );
      }

      const updatedTranslation = await translationService.addUserFeedback(
        params.id,
        body.rating,
        body.feedback
      );

      return NextResponse.json({ translation: updatedTranslation });
    }

    if (body.action === 'cancel') {
      if (translation.status !== 'pending') {
        return NextResponse.json(
          { error: 'Can only cancel pending translations' },
          { status: 400 }
        );
      }

      const cancelledTranslation = await translationService.cancelTranslation(params.id);
      return NextResponse.json({ translation: cancelledTranslation });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Translation PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/translations/[id]
 * Cancel a pending translation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const translationService = new TranslationService();

    // Get translation to check ownership and status
    const translation = await translationService.getTranslationById(params.id);
    if (!translation) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (translation.requested_by !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Can only cancel pending translations
    if (translation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending translations' },
        { status: 400 }
      );
    }

    const cancelledTranslation = await translationService.cancelTranslation(params.id);
    return NextResponse.json({ translation: cancelledTranslation });

  } catch (error) {
    console.error('Translation DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}