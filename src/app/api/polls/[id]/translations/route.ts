// Poll Translations API Routes
// RESTful endpoints for managing poll translations

import { NextRequest, NextResponse } from 'next/server';
import { PollTranslationService } from '@/lib/services/pollTranslationService';
import { Language } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

// Validate translation creation request
interface TranslationCreationBody {
  language: string;
  question: string;
  description?: string;
}

interface TranslationRequestBody {
  target_languages: string[];
}

function validateTranslationCreation(body: any): body is TranslationCreationBody {
  return (
    body &&
    typeof body.language === 'string' &&
    typeof body.question === 'string' &&
    ['french', 'arabic'].includes(body.language)
  );
}

function validateTranslationRequest(body: any): body is TranslationRequestBody {
  return (
    body &&
    Array.isArray(body.target_languages) &&
    body.target_languages.every((lang: any) => 
      typeof lang === 'string' && ['french', 'arabic'].includes(lang)
    )
  );
}

/**
 * GET /api/polls/[id]/translations
 * 
 * Get all translations for a poll
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const pollId = params.id;
    const translationService = new PollTranslationService();

    // Get all translations for the poll
    const translations = await translationService.getPollTranslations(pollId);
    
    // Get available languages
    const availableLanguages = await translationService.getAvailableLanguages(pollId);
    
    // Get translation completeness
    const completeness = await translationService.getTranslationCompleteness(pollId);

    return NextResponse.json({
      translations,
      available_languages: availableLanguages,
      completeness,
    });

  } catch (error) {
    console.error('Poll translations API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/polls/[id]/translations
 * 
 * Create a new translation for a poll
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Only admins and content editors can create translations
    if (user.role !== 'admin' && user.role !== 'contentEditor') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const pollId = params.id;
    const body = await request.json();

    // Check if this is a translation request or manual translation creation
    if (body.target_languages) {
      // Handle automatic translation request
      if (!validateTranslationRequest(body)) {
        return NextResponse.json(
          { error: 'Invalid translation request. Required: target_languages array' },
          { status: 400 }
        );
      }

      const translationService = new PollTranslationService();

      const results = await translationService.requestPollTranslation({
        poll_id: pollId,
        target_languages: body.target_languages as Language[],
        requested_by: user.id,
      });

      return NextResponse.json(
        { results },
        { status: 201 }
      );
    } else {
      // Handle manual translation creation
      if (!validateTranslationCreation(body)) {
        return NextResponse.json(
          { error: 'Invalid translation data. Required: language, question' },
          { status: 400 }
        );
      }

      const translationService = new PollTranslationService();

      const translation = await translationService.createPollTranslation({
        poll_id: pollId,
        language: body.language as Language,
        question: body.question,
        description: body.description,
      });

      return NextResponse.json(
        { translation },
        { status: 201 }
      );
    }

  } catch (error) {
    console.error('Poll translations API POST error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Poll not found')) {
        return NextResponse.json(
          { error: 'Poll not found' },
          { status: 404 }
        );
      }

      if (error.message.includes('Translation already exists')) {
        return NextResponse.json(
          { error: 'Translation already exists for this language' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}