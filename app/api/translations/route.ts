// Translation API Routes - RESTful endpoints for document translation
// Following established project patterns and TDD methodology

import { NextRequest, NextResponse } from 'next/server';
import { TranslationService } from '@/lib/services/translationService';
import { Language } from '@prisma/client';

import { getCurrentUser } from '@/lib/auth';

// Validate language codes
const VALID_LANGUAGES: Language[] = ['french', 'arabic'];

function isValidLanguage(lang: string): lang is Language {
  return VALID_LANGUAGES.includes(lang as Language);
}

// Validate translation request body
interface TranslationRequestBody {
  document_id: string;
  source_language: string;
  target_language: string;
}

function validateTranslationRequest(body: any): body is TranslationRequestBody {
  return (
    body &&
    typeof body.document_id === 'string' &&
    typeof body.source_language === 'string' &&
    typeof body.target_language === 'string' &&
    isValidLanguage(body.source_language) &&
    isValidLanguage(body.target_language)
  );
}

/**
 * GET /api/translations
 * 
 * Query parameters:
 * - document_id: Get translations for specific document
 * - stats: Get translation statistics (stats=true)
 * - status: Filter by translation status (pending, processing, completed, failed)
 * - limit: Limit number of results
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('document_id');
    const showStats = searchParams.get('stats') === 'true';
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const translationService = new TranslationService();

    // Return statistics if requested
    if (showStats) {
      const stats = await translationService.getTranslationStats();
      return NextResponse.json({ stats });
    }

    // Return translations for specific document
    if (documentId) {
      const translations = await translationService.getTranslationsByDocument(documentId);
      return NextResponse.json({ translations });
    }

    // Return translations filtered by status
    if (status) {
      const translations = await translationService.getTranslationsByStatus(status, limit);
      return NextResponse.json({ translations });
    }

    // Return translations for current user
    const translations = await translationService.getTranslationsByUser(user.id);
    return NextResponse.json({ translations });

  } catch (error) {
    console.error('Translation API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/translations
 * 
 * Create a new translation request
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    if (!validateTranslationRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: document_id, source_language, target_language' },
        { status: 400 }
      );
    }

    const translationService = new TranslationService();

    // Create translation request
    const translation = await translationService.requestTranslation({
      document_id: body.document_id,
      source_language: body.source_language as Language,
      target_language: body.target_language as Language,
      requested_by: user.id,
    });

    return NextResponse.json(
      { translation },
      { status: 201 }
    );

  } catch (error) {
    console.error('Translation API POST error:', error);

    // Handle specific errors with appropriate status codes
    if (error instanceof Error) {
      if (error.message.includes('Document not found')) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      if (error.message.includes('Translation already exists')) {
        return NextResponse.json(
          { error: 'Translation already exists for this document and language' },
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