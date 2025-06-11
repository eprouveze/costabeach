// Individual Poll Management API
// RESTful endpoints for managing specific polls

import { NextRequest, NextResponse } from 'next/server';
import { PollsService } from '@/lib/services/pollsService';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/polls/[id]
 * Get specific poll details with statistics
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
    
    // Get poll details
    const poll = await pollsService.getPollById(params.id);
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Get poll statistics
    const statistics = await pollsService.getPollStatistics(params.id);
    
    // Check if user has voted
    const hasVoted = await pollsService.hasUserVoted(params.id, user.id);

    return NextResponse.json({ 
      poll, 
      statistics,
      has_voted: hasVoted 
    });

  } catch (error) {
    console.error('Poll GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/polls/[id]
 * Update poll (publish, close, update details)
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
    const pollsService = new PollsService();

    // Get poll to check ownership
    const poll = await pollsService.getPollById(params.id);
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check permissions (only creator or admin)
    if (poll.created_by !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Handle different update actions
    if (body.action === 'publish') {
      if (poll.status !== 'draft') {
        return NextResponse.json(
          { error: 'Can only publish draft polls' },
          { status: 400 }
        );
      }

      const publishedPoll = await pollsService.publishPoll(params.id, user.id);
      return NextResponse.json({ poll: publishedPoll });
    }

    if (body.action === 'close') {
      if (poll.status !== 'published') {
        return NextResponse.json(
          { error: 'Can only close published polls' },
          { status: 400 }
        );
      }

      const closedPoll = await pollsService.closePoll(params.id, user.id);
      return NextResponse.json({ poll: closedPoll });
    }

    if (body.action === 'update') {
      if (poll.status !== 'draft') {
        return NextResponse.json(
          { error: 'Can only update draft polls' },
          { status: 400 }
        );
      }

      // Validate update data
      const updates: any = {};
      if (body.question !== undefined) updates.question = body.question;
      if (body.poll_type !== undefined) updates.poll_type = body.poll_type;
      if (body.options !== undefined) updates.options = body.options;
      if (body.max_choices !== undefined) updates.max_choices = body.max_choices;
      if (body.is_anonymous !== undefined) updates.is_anonymous = body.is_anonymous;
      if (body.voting_deadline !== undefined) {
        if (body.voting_deadline) {
          const deadline = new Date(body.voting_deadline);
          if (isNaN(deadline.getTime()) || deadline <= new Date()) {
            return NextResponse.json(
              { error: 'Invalid voting deadline' },
              { status: 400 }
            );
          }
          updates.voting_deadline = deadline;
        } else {
          updates.voting_deadline = null;
        }
      }
      if (body.require_explanation !== undefined) updates.require_explanation = body.require_explanation;

      const updatedPoll = await pollsService.updatePoll(params.id, user.id, updates);
      return NextResponse.json({ poll: updatedPoll });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported: publish, close, update' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Poll PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/polls/[id]
 * Delete a draft poll
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

    const pollsService = new PollsService();

    // Get poll to check ownership and status
    const poll = await pollsService.getPollById(params.id);
    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    // Check permissions (only creator or admin)
    if (poll.created_by !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Can only delete draft polls
    if (poll.status !== 'draft') {
      return NextResponse.json(
        { error: 'Can only delete draft polls' },
        { status: 400 }
      );
    }

    await pollsService.deletePoll(params.id, user.id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Poll DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}