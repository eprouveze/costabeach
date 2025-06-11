// Poll Voting API
// RESTful endpoint for casting votes on polls

import { NextRequest, NextResponse } from 'next/server';
import { PollsService } from '@/lib/services/pollsService';
import { getCurrentUser } from '@/lib/auth';

// Validate vote request body
interface VoteRequestBody {
  option_ids: string[];
  explanation?: string;
}

function validateVoteRequest(body: any): body is VoteRequestBody {
  return (
    body &&
    Array.isArray(body.option_ids) &&
    body.option_ids.length > 0 &&
    body.option_ids.every((id: any) => typeof id === 'string')
  );
}

/**
 * POST /api/polls/[id]/vote
 * Cast a vote on a poll
 */
export async function POST(
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

    // Parse and validate request body
    const body = await request.json();
    
    if (!validateVoteRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request body. Required: option_ids (array)' },
        { status: 400 }
      );
    }

    const pollsService = new PollsService();

    // Check if poll exists and is active
    const poll = await pollsService.getPollById(params.id);
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    if (poll.status !== 'published') {
      return NextResponse.json(
        { error: 'Poll is not active for voting' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const hasVoted = await pollsService.hasUserVoted(params.id, user.id);
    if (hasVoted) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 409 }
      );
    }

    // Cast the vote
    const votes = await pollsService.castVote({
      poll_id: params.id,
      user_id: user.id,
      option_ids: body.option_ids,
      explanation: body.explanation,
    });

    // Get updated statistics
    const statistics = await pollsService.getPollStatistics(params.id);

    return NextResponse.json(
      { 
        votes, 
        statistics,
        message: 'Vote cast successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Vote POST error:', error);

    // Handle specific errors with appropriate status codes
    if (error instanceof Error) {
      if (error.message.includes('Poll is not active')) {
        return NextResponse.json(
          { error: 'Poll is not active for voting' },
          { status: 400 }
        );
      }

      if (error.message.includes('already voted')) {
        return NextResponse.json(
          { error: 'You have already voted on this poll' },
          { status: 409 }
        );
      }

      if (error.message.includes('Voting deadline has passed')) {
        return NextResponse.json(
          { error: 'Voting deadline has passed' },
          { status: 400 }
        );
      }

      if (error.message.includes('exactly one selection')) {
        return NextResponse.json(
          { error: 'Single choice polls require exactly one selection' },
          { status: 400 }
        );
      }

      if (error.message.includes('Too many choices')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes('Invalid option IDs')) {
        return NextResponse.json(
          { error: 'Invalid option IDs provided' },
          { status: 400 }
        );
      }

      if (error.message.includes('Explanation is required')) {
        return NextResponse.json(
          { error: 'Explanation is required for this poll' },
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

/**
 * GET /api/polls/[id]/vote
 * Get user's vote on this poll
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

    const pollsService = new PollsService();

    // Check if poll exists
    const poll = await pollsService.getPollById(params.id);
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check if user has voted
    const hasVoted = await pollsService.hasUserVoted(params.id, user.id);
    
    if (!hasVoted) {
      return NextResponse.json({ 
        has_voted: false,
        votes: [] 
      });
    }

    // Get user's voting history for this poll
    const votingHistory = await pollsService.getUserVotingHistory(user.id);
    const pollVotes = votingHistory.filter(vote => vote.poll_id === params.id);

    return NextResponse.json({ 
      has_voted: true,
      votes: pollVotes 
    });

  } catch (error) {
    console.error('Vote GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}