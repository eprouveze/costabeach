// Individual Poll Translation API Routes
// RESTful endpoints for specific language translations

import { NextRequest, NextResponse } from 'next/server';
import { PollTranslationService } from '@/lib/services/pollTranslationService';
import { Language } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

// Validate translation update request
interface TranslationUpdateBody {
  question?: string;
  description?: string;
}

function validateTranslationUpdate(body: any): body is TranslationUpdateBody {
  return (
    body &&
    (typeof body.question === 'string' || typeof body.description === 'string' || body.description === undefined)
  );
}

/**
 * GET /api/polls/[id]/translations/[language]
 * 
 * Get a specific translation for a poll
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; language: string } }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: pollId, language } = params;

    // Validate language parameter
    if (!['french', 'arabic'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported: french, arabic' },
        { status: 400 }
      );
    }

    const translationService = new PollTranslationService();

    // Get localized poll
    const localizedPoll = await translationService.getLocalizedPoll(
      pollId,
      language as Language
    );

    if (!localizedPoll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if translation exists in the requested language
    const hasTranslation = await translationService.hasTranslation(
      pollId,
      language as Language
    );

    return NextResponse.json({
      poll: localizedPoll,
      has_translation: hasTranslation,
      is_original: !hasTranslation,
    });

  } catch (error) {
    console.error('Poll translation API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/polls/[id]/translations/[language]
 * 
 * Update a specific translation for a poll
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; language: string } }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins and content editors can update translations
    if (user.role !== 'admin' && user.role !== 'contentEditor') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: pollId, language } = params;

    // Validate language parameter
    if (!['french', 'arabic'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported: french, arabic' },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!validateTranslationUpdate(body)) {
      return NextResponse.json(
        { error: 'Invalid update data. Provide question and/or description' },
        { status: 400 }
      );
    }

    const translationService = new PollTranslationService();

    const updatedTranslation = await translationService.updatePollTranslation(
      pollId,
      language as Language,
      body
    );

    return NextResponse.json({
      translation: updatedTranslation,
    });

  } catch (error) {
    console.error('Poll translation API PUT error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Translation not found')) {
        return NextResponse.json(
          { error: 'Translation not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/polls/[id]/translations/[language]
 * 
 * Delete a specific translation for a poll
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; language: string } }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can delete translations
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id: pollId, language } = params;

    // Validate language parameter
    if (!['french', 'arabic'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported: french, arabic' },
        { status: 400 }
      );
    }

    // Prevent deletion of original language
    if (language === 'french') {
      return NextResponse.json(
        { error: 'Cannot delete original language translation' },
        { status: 400 }
      );
    }

    const translationService = new PollTranslationService();

    await translationService.deletePollTranslation(
      pollId,
      language as Language
    );

    return NextResponse.json({
      success: true,
      message: 'Translation deleted successfully',
    });

  } catch (error) {
    console.error('Poll translation API DELETE error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Translation not found')) {
        return NextResponse.json(
          { error: 'Translation not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}