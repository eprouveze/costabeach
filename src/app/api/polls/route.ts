// Polls API Routes - RESTful endpoints for community polls
// Following established project patterns and TDD methodology

import { NextRequest, NextResponse } from 'next/server';
import { PollsService } from '@/lib/services/pollsService';
import { PollType } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

// Validate poll creation request body
interface PollCreationBody {
  question: string;
  poll_type: string;
  options: string[];
  max_choices?: number;
  is_anonymous?: boolean;
  voting_deadline?: string;
  require_explanation?: boolean;
}

function validatePollCreation(body: any): body is PollCreationBody {
  return (
    body &&
    typeof body.question === 'string' &&
    typeof body.poll_type === 'string' &&
    Array.isArray(body.options) &&
    body.options.length >= 2 &&
    body.options.every((opt: any) => typeof opt === 'string') &&
    ['single_choice', 'multiple_choice'].includes(body.poll_type)
  );
}

/**
 * GET /api/polls
 * 
 * Query parameters:
 * - status: Filter by poll status (active, closed, draft)
 * - created_by: Get polls created by specific user
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
    const status = searchParams.get('status');
    const createdBy = searchParams.get('created_by');

    const pollsService = new PollsService();

    // Return polls by creator
    if (createdBy) {
      // Check if user can view polls by other users (admin/contentEditor only)
      if (createdBy !== user.id && user.role !== 'admin' && user.role !== 'contentEditor') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      const polls = await pollsService.getPollsByCreator(createdBy);
      return NextResponse.json({ polls });
    }

    // Return active polls (default)
    if (!status || status === 'active') {
      const polls = await pollsService.getActivePolls();
      return NextResponse.json({ polls });
    }

    // For other statuses, only return user's own polls unless admin
    if (user.role !== 'admin' && user.role !== 'contentEditor') {
      const polls = await pollsService.getPollsByCreator(user.id);
      const filteredPolls = polls.filter((poll: any) => poll.status === status);
      return NextResponse.json({ polls: filteredPolls });
    }

    // Admin can see all polls with any status
    const polls = await pollsService.getActivePolls(); // Would need to extend service for status filtering
    return NextResponse.json({ polls });

  } catch (error) {
    console.error('Polls API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/polls
 * 
 * Create a new poll
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
    
    if (!validatePollCreation(body)) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: question, poll_type, options (min 2)' },
        { status: 400 }
      );
    }

    // Additional validation
    if (body.poll_type === 'multiple_choice' && body.max_choices) {
      if (body.max_choices < 1 || body.max_choices > body.options.length) {
        return NextResponse.json(
          { error: 'Invalid max_choices value' },
          { status: 400 }
        );
      }
    }

    const pollsService = new PollsService();

    // Parse voting deadline if provided
    let votingDeadline: Date | undefined;
    if (body.voting_deadline) {
      votingDeadline = new Date(body.voting_deadline);
      if (isNaN(votingDeadline.getTime())) {
        return NextResponse.json(
          { error: 'Invalid voting_deadline format' },
          { status: 400 }
        );
      }
      if (votingDeadline <= new Date()) {
        return NextResponse.json(
          { error: 'Voting deadline must be in the future' },
          { status: 400 }
        );
      }
    }

    // Create poll
    const result = await pollsService.createPoll({
      question: body.question,
      pollType: body.poll_type as PollType,
      options: body.options,
      createdBy: user.id,
      maxChoices: body.max_choices,
      isAnonymous: body.is_anonymous,
      votingDeadline: votingDeadline,
      requireExplanation: body.require_explanation,
    });

    return NextResponse.json(
      { poll: result.poll, options: result.options },
      { status: 201 }
    );

  } catch (error) {
    console.error('Polls API POST error:', error);

    // Handle specific errors with appropriate status codes
    if (error instanceof Error) {
      if (error.message.includes('Poll question is required')) {
        return NextResponse.json(
          { error: 'Poll question is required' },
          { status: 400 }
        );
      }

      if (error.message.includes('At least 2 options are required')) {
        return NextResponse.json(
          { error: 'At least 2 options are required' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}