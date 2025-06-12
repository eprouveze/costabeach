// Polls Service Implementation - Community Management
// Following TDD methodology and existing project patterns

import { PrismaClient, PollType, PollStatus, Language } from '@prisma/client';
import { db } from '@/lib/db';
import { whatsappNotificationService } from './whatsappNotificationService';

export interface PollCreationData {
  question: string;
  poll_type: PollType;
  options: string[];
  created_by: string;
  max_choices?: number;
  is_anonymous?: boolean;
  voting_deadline?: Date;
  require_explanation?: boolean;
}

export interface VoteData {
  poll_id: string;
  user_id: string;
  option_ids: string[];
  explanation?: string;
}

export interface PollStatistics {
  poll_id: string;
  total_votes: number;
  option_results: OptionResult[];
  participation_rate?: number;
}

export interface OptionResult {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

export class PollsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = db;
  }

  /**
   * Create a new poll with options
   */
  async createPoll(data: PollCreationData) {
    // Validation
    if (!data.question || data.question.trim().length === 0) {
      throw new Error('Poll question is required');
    }

    if (!data.options || data.options.length < 2) {
      throw new Error('At least 2 options are required');
    }

    if (data.poll_type === 'multiple_choice' && data.max_choices && data.max_choices > data.options.length) {
      throw new Error('Maximum choices cannot exceed number of options');
    }

    // Create poll and options in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the poll
      const poll = await tx.poll.create({
        data: {
          question: data.question,
          poll_type: data.poll_type,
          created_by: data.created_by,
          is_anonymous: data.is_anonymous || true,
          end_date: data.voting_deadline,
          status: 'draft',
        },
      });

      // Create options
      const options = [];
      for (let i = 0; i < data.options.length; i++) {
        const option = await tx.pollOption.create({
          data: {
            poll_id: poll.id,
            option_text: data.options[i],
            order_index: i,
          },
        });
        options.push(option);
      }

      return { poll, options };
    });

    return result;
  }

  /**
   * Publish a draft poll to make it active
   */
  async publishPoll(pollId: string, userId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.created_by !== userId) {
      throw new Error('Only poll creator can publish');
    }

    if (poll.status !== 'draft') {
      throw new Error('Only draft polls can be published');
    }

    const updatedPoll = await this.prisma.poll.update({
      where: { id: pollId },
      data: {
        status: 'published',
      },
    });

    // Send WhatsApp notification for poll publication
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true }
      });
      
      const creatorName = user ? 
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 
        'Unknown User';
      
      // Create poll URL (this would be the actual URL to view/vote on the poll)
      const pollUrl = `${process.env.NEXTAUTH_URL || 'https://costabeach.com'}/polls/${pollId}`;
      
      await whatsappNotificationService.sendPollNotification({
        title: updatedPoll.question,
        description: `A new community poll has been published and is ready for voting.`,
        createdBy: creatorName,
        endDate: updatedPoll.end_date || undefined,
        pollUrl
      });
    } catch (notificationError) {
      // Don't fail the poll publication if notification fails
      console.error('Failed to send WhatsApp notification for poll:', notificationError);
    }

    return updatedPoll;
  }

  /**
   * Close an active poll
   */
  async closePoll(pollId: string, userId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.created_by !== userId) {
      throw new Error('Only poll creator can close');
    }

    if (poll.status !== 'published') {
      throw new Error('Only published polls can be closed');
    }

    const closedPoll = await this.prisma.poll.update({
      where: { id: pollId },
      data: {
        status: 'closed',
      },
    });

    return closedPoll;
  }

  /**
   * Cast a vote on a poll
   */
  async castVote(voteData: VoteData) {
    // Get poll information
    const poll = await this.prisma.poll.findUnique({
      where: { id: voteData.poll_id },
      include: { options: true },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.status !== 'published') {
      throw new Error('Poll is not published');
    }

    // Check voting deadline
    if (poll.end_date && new Date() > poll.end_date) {
      throw new Error('Voting deadline has passed');
    }

    // Check if user has already voted
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        poll_id: voteData.poll_id,
        user_id: voteData.user_id,
      },
    });

    if (existingVote) {
      throw new Error('User has already voted on this poll');
    }

    // Validate vote choices
    if (poll.poll_type === 'single_choice' && voteData.option_ids.length !== 1) {
      throw new Error('Single choice polls require exactly one selection');
    }

    // Multiple choice polls allow multiple selections

    // Validate that all option IDs belong to this poll
    const validOptionIds = poll.options.map(opt => opt.id);
    const invalidOptions = voteData.option_ids.filter(id => !validOptionIds.includes(id));
    if (invalidOptions.length > 0) {
      throw new Error('Invalid option IDs provided');
    }

    // Comments are optional

    // Create votes
    const votes = [];
    if (poll.poll_type === 'single_choice') {
      const vote = await this.prisma.vote.create({
        data: {
          poll_id: voteData.poll_id,
          user_id: voteData.user_id,
          option_id: voteData.option_ids[0],
        },
      });
      votes.push(vote);
    } else {
      // Multiple choice - create multiple vote records in transaction
      const createdVotes = await this.prisma.$transaction(
        voteData.option_ids.map(optionId =>
          this.prisma.vote.create({
            data: {
              poll_id: voteData.poll_id,
              user_id: voteData.user_id,
              option_id: optionId,
                },
          })
        )
      );
      votes.push(...createdVotes);
    }

    return votes;
  }

  /**
   * Get poll statistics and results
   */
  async getPollStatistics(pollId: string): Promise<PollStatistics> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    // Get vote counts per option using raw aggregation
    const voteResults = await this.prisma.vote.findMany({
      where: { poll_id: pollId },
      select: {
        option_id: true,
        id: true,
      },
    });

    // Count votes per option
    const voteCounts = voteResults.reduce((acc, vote) => {
      acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get total unique voters
    const uniqueVoters = await this.prisma.vote.groupBy({
      by: ['user_id'],
      where: { poll_id: pollId },
    });
    const totalVotes = uniqueVoters.length;

    // Calculate option results
    const optionResults: OptionResult[] = poll.options.map(option => {
      const voteCount = voteCounts[option.id] || 0;
      const percentage = totalVotes > 0 ? Number(((voteCount / totalVotes) * 100).toFixed(2)) : 0;

      return {
        option_id: option.id,
        option_text: option.option_text,
        vote_count: voteCount,
        percentage,
      };
    });

    return {
      poll_id: pollId,
      total_votes: totalVotes,
      option_results: optionResults,
    };
  }

  /**
   * Get list of active polls
   */
  async getActivePolls() {
    const polls = await this.prisma.poll.findMany({
      where: { status: 'published' },
      include: {
        options: true,
        _count: {
          select: { votes: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return polls;
  }

  /**
   * Get polls created by a specific user
   */
  async getPollsByCreator(userId: string) {
    const polls = await this.prisma.poll.findMany({
      where: { created_by: userId },
      include: {
        options: true,
        _count: {
          select: { votes: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return polls;
  }

  /**
   * Get user's voting history
   */
  async getUserVotingHistory(userId: string) {
    const votes = await this.prisma.vote.findMany({
      where: { user_id: userId },
      include: {
        poll: {
          select: { question: true, status: true },
        },
        option: {
          select: { option_text: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return votes;
  }

  /**
   * Get poll by ID with full details
   */
  async getPollById(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          orderBy: { order_index: 'asc' },
        },
        creator: {
          select: { id: true, name: true },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    return poll;
  }

  /**
   * Check if user has voted on a specific poll
   */
  async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    const vote = await this.prisma.vote.findFirst({
      where: {
        poll_id: pollId,
        user_id: userId,
      },
    });

    return !!vote;
  }

  /**
   * Delete a poll (only draft polls)
   */
  async deletePoll(pollId: string, userId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.created_by !== userId) {
      throw new Error('Only poll creator can delete');
    }

    if (poll.status !== 'draft') {
      throw new Error('Only draft polls can be deleted');
    }

    // Delete poll and related options/votes in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete votes first
      await tx.vote.deleteMany({
        where: { poll_id: pollId },
      });

      // Delete options
      await tx.pollOption.deleteMany({
        where: { poll_id: pollId },
      });

      // Delete poll
      await tx.poll.delete({
        where: { id: pollId },
      });
    });

    return { success: true };
  }

  /**
   * Update poll details (only draft polls)
   */
  async updatePoll(pollId: string, userId: string, updates: Partial<PollCreationData>) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.created_by !== userId) {
      throw new Error('Only poll creator can update');
    }

    if (poll.status !== 'draft') {
      throw new Error('Only draft polls can be updated');
    }

    // Update poll
    const updatedPoll = await this.prisma.poll.update({
      where: { id: pollId },
      data: {
        question: updates.question,
        poll_type: updates.poll_type,
        is_anonymous: updates.is_anonymous,
        end_date: updates.voting_deadline,
      },
    });

    // If options are provided, update them
    if (updates.options && updates.options.length >= 2) {
      await this.prisma.$transaction(async (tx) => {
        // Delete existing options
        await tx.pollOption.deleteMany({
          where: { poll_id: pollId },
        });

        // Create new options
        for (let i = 0; i < updates.options!.length; i++) {
          await tx.pollOption.create({
            data: {
              poll_id: pollId,
              option_text: updates.options![i],
              order_index: i,
            },
          });
        }
      });
    }

    return updatedPoll;
  }
}