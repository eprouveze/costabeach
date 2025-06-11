// Polls Service Tests - TDD for Community Management
// Testing polls creation, voting, and management functionality

import { PollsService } from '../pollsService';

// Mock Prisma client
const mockPrismaClient = {
  poll: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  pollOption: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  vote: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  pollTranslation: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock getCurrentUser
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));

describe('PollsService', () => {
  let pollsService: PollsService;

  beforeEach(() => {
    jest.clearAllMocks();
    pollsService = new PollsService();
    (pollsService as any).prisma = mockPrismaClient;
  });

  describe('Poll Creation', () => {
    it('should create a single choice poll successfully', async () => {
      const pollData = {
        question: 'Should we install new playground equipment?',
        poll_type: 'single_choice' as const,
        options: ['Yes, install new equipment', 'No, keep current equipment'],
        created_by: 'user-123',
        is_anonymous: true,
        voting_deadline: new Date('2025-03-01'),
      };

      const mockPoll = {
        id: 'poll-456',
        question: pollData.question,
        poll_type: pollData.poll_type,
        status: 'draft',
        created_by: pollData.created_by,
        is_anonymous: pollData.is_anonymous,
        voting_deadline: pollData.voting_deadline,
        created_at: new Date(),
      };

      const mockOptions = [
        { id: 'opt-1', poll_id: 'poll-456', option_text: 'Yes, install new equipment', option_order: 0 },
        { id: 'opt-2', poll_id: 'poll-456', option_text: 'No, keep current equipment', option_order: 1 },
      ];

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaClient);
      });
      mockPrismaClient.poll.create.mockResolvedValue(mockPoll);
      mockPrismaClient.pollOption.create
        .mockResolvedValueOnce(mockOptions[0])
        .mockResolvedValueOnce(mockOptions[1]);

      const result = await pollsService.createPoll(pollData);

      expect(mockPrismaClient.poll.create).toHaveBeenCalledWith({
        data: {
          question: pollData.question,
          poll_type: pollData.poll_type,
          created_by: pollData.created_by,
          max_choices: undefined,
          is_anonymous: pollData.is_anonymous,
          voting_deadline: pollData.voting_deadline,
          require_explanation: false,
          status: 'draft',
        },
      });

      expect(mockPrismaClient.pollOption.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ poll: mockPoll, options: mockOptions });
    });

    it('should create a multiple choice poll', async () => {
      const pollData = {
        question: 'What amenities should we prioritize? (Select up to 3)',
        poll_type: 'multiple_choice' as const,
        max_choices: 3,
        options: ['Swimming pool', 'Gym', 'Community garden', 'Parking spaces'],
        created_by: 'user-123',
      };

      const mockPoll = {
        id: 'poll-789',
        ...pollData,
        status: 'draft',
        created_at: new Date(),
      };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaClient);
      });
      mockPrismaClient.poll.create.mockResolvedValue(mockPoll);
      mockPrismaClient.pollOption.create.mockResolvedValue({});

      const result = await pollsService.createPoll(pollData);

      expect(mockPrismaClient.poll.create).toHaveBeenCalledWith({
        data: {
          question: pollData.question,
          poll_type: pollData.poll_type,
          max_choices: pollData.max_choices,
          created_by: pollData.created_by,
          is_anonymous: true,
          voting_deadline: undefined,
          require_explanation: false,
          status: 'draft',
        },
      });

      expect(mockPrismaClient.pollOption.create).toHaveBeenCalledTimes(4);
    });

    it('should validate poll data before creation', async () => {
      const invalidPollData = {
        question: '', // Empty question
        poll_type: 'single_choice' as const,
        options: ['Option 1'], // Only one option
        created_by: 'user-123',
      };

      await expect(pollsService.createPoll(invalidPollData)).rejects.toThrow('Poll question is required');

      const singleOptionData = {
        question: 'Valid question?',
        poll_type: 'single_choice' as const,
        options: ['Only option'],
        created_by: 'user-123',
      };

      await expect(pollsService.createPoll(singleOptionData)).rejects.toThrow('At least 2 options are required');
    });
  });

  describe('Poll Management', () => {
    it('should publish a draft poll', async () => {
      const pollId = 'poll-456';
      const mockPoll = {
        id: pollId,
        status: 'draft',
        created_by: 'user-123',
      };

      const updatedPoll = {
        ...mockPoll,
        status: 'active',
        published_at: new Date(),
      };

      mockPrismaClient.poll.findUnique.mockResolvedValue(mockPoll);
      mockPrismaClient.poll.update.mockResolvedValue(updatedPoll);

      const result = await pollsService.publishPoll(pollId, 'user-123');

      expect(mockPrismaClient.poll.update).toHaveBeenCalledWith({
        where: { id: pollId },
        data: {
          status: 'active',
          published_at: expect.any(Date),
        },
      });

      expect(result.status).toBe('active');
    });

    it('should close an active poll', async () => {
      const pollId = 'poll-456';
      const mockPoll = {
        id: pollId,
        status: 'active',
        created_by: 'user-123',
      };

      const closedPoll = {
        ...mockPoll,
        status: 'closed',
        closed_at: new Date(),
      };

      mockPrismaClient.poll.findUnique.mockResolvedValue(mockPoll);
      mockPrismaClient.poll.update.mockResolvedValue(closedPoll);

      const result = await pollsService.closePoll(pollId, 'user-123');

      expect(mockPrismaClient.poll.update).toHaveBeenCalledWith({
        where: { id: pollId },
        data: {
          status: 'closed',
          closed_at: expect.any(Date),
        },
      });

      expect(result.status).toBe('closed');
    });

    it('should get poll statistics', async () => {
      const pollId = 'poll-456';
      const mockPoll = {
        id: pollId,
        question: 'Test poll?',
        poll_type: 'single_choice',
        status: 'active',
      };

      const mockOptions = [
        { id: 'opt-1', option_text: 'Yes', option_order: 0 },
        { id: 'opt-2', option_text: 'No', option_order: 1 },
      ];

      const mockVoteResults = [
        { option_id: 'opt-1', id: 'vote-1' },
        { option_id: 'opt-2', id: 'vote-2' },
      ];

      mockPrismaClient.poll.findUnique.mockResolvedValue({ ...mockPoll, options: mockOptions });
      mockPrismaClient.vote.findMany.mockResolvedValue(mockVoteResults);
      mockPrismaClient.vote.count.mockResolvedValue(2); // Total unique voters

      const stats = await pollsService.getPollStatistics(pollId);

      expect(stats.poll_id).toBe(pollId);
      expect(stats.total_votes).toBe(2);
      expect(stats.option_results).toHaveLength(2);
      expect(stats.option_results[0]).toEqual({
        option_id: 'opt-1',
        option_text: 'Yes',
        vote_count: 1,
        percentage: 50, // 1/2 * 100
      });
    });
  });

  describe('Voting System', () => {
    it('should record a single choice vote', async () => {
      const voteData = {
        poll_id: 'poll-456',
        user_id: 'user-123',
        option_ids: ['opt-1'],
      };

      const mockPoll = {
        id: 'poll-456',
        poll_type: 'single_choice',
        status: 'active',
        voting_deadline: new Date('2025-12-31'), // Future date
        options: [
          { id: 'opt-1', option_text: 'Option 1' },
        ],
      };

      const mockVote = {
        id: 'vote-789',
        poll_id: voteData.poll_id,
        user_id: voteData.user_id,
        option_id: 'opt-1',
        voted_at: new Date(),
      };

      mockPrismaClient.poll.findUnique.mockResolvedValue(mockPoll);
      mockPrismaClient.vote.findFirst.mockResolvedValue(null); // No existing vote
      mockPrismaClient.vote.create.mockResolvedValue(mockVote);

      const result = await pollsService.castVote(voteData);

      expect(mockPrismaClient.vote.create).toHaveBeenCalledWith({
        data: {
          poll_id: voteData.poll_id,
          user_id: voteData.user_id,
          option_id: 'opt-1',
        },
      });

      expect(result).toEqual([mockVote]);
    });

    it('should record multiple choice votes', async () => {
      const voteData = {
        poll_id: 'poll-789',
        user_id: 'user-123',
        option_ids: ['opt-1', 'opt-3'],
      };

      const mockPoll = {
        id: 'poll-789',
        poll_type: 'multiple_choice',
        max_choices: 3,
        status: 'active',
        voting_deadline: new Date('2025-12-31'), // Future date
        options: [
          { id: 'opt-1', option_text: 'Option 1' },
          { id: 'opt-3', option_text: 'Option 3' },
        ],
      };

      mockPrismaClient.poll.findUnique.mockResolvedValue(mockPoll);
      mockPrismaClient.vote.findFirst.mockResolvedValue(null);
      
      // Mock the transaction to return array of created votes directly
      mockPrismaClient.$transaction.mockResolvedValue([
        { id: 'vote-1', option_id: 'opt-1' },
        { id: 'vote-2', option_id: 'opt-3' }
      ]);

      const result = await pollsService.castVote(voteData);

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should prevent voting on closed polls', async () => {
      const voteData = {
        poll_id: 'poll-456',
        user_id: 'user-123',
        option_ids: ['opt-1'],
      };

      const mockPoll = {
        id: 'poll-456',
        status: 'closed',
      };

      mockPrismaClient.poll.findUnique.mockResolvedValue(mockPoll);

      await expect(pollsService.castVote(voteData)).rejects.toThrow('Poll is not active');
    });

    it('should prevent duplicate voting', async () => {
      const voteData = {
        poll_id: 'poll-456',
        user_id: 'user-123',
        option_ids: ['opt-1'],
      };

      const mockPoll = {
        id: 'poll-456',
        status: 'active',
        voting_deadline: new Date('2025-12-31'), // Future date
        options: [
          { id: 'opt-1', option_text: 'Option 1' },
        ],
      };

      const existingVote = {
        id: 'vote-existing',
        user_id: 'user-123',
      };

      mockPrismaClient.poll.findUnique.mockResolvedValue(mockPoll);
      mockPrismaClient.vote.findFirst.mockResolvedValue(existingVote);

      await expect(pollsService.castVote(voteData)).rejects.toThrow('User has already voted on this poll');
    });

    it('should validate choice limits for multiple choice polls', async () => {
      const voteData = {
        poll_id: 'poll-789',
        user_id: 'user-123',
        option_ids: ['opt-1', 'opt-2', 'opt-3', 'opt-4'], // 4 choices
      };

      const mockPoll = {
        id: 'poll-789',
        poll_type: 'multiple_choice',
        max_choices: 2, // Only 2 allowed
        status: 'active',
      };

      mockPrismaClient.poll.findUnique.mockResolvedValue(mockPoll);
      mockPrismaClient.vote.findFirst.mockResolvedValue(null);

      await expect(pollsService.castVote(voteData)).rejects.toThrow('Too many choices selected. Maximum allowed: 2');
    });
  });

  describe('Poll Listing and Filtering', () => {
    it('should list active polls', async () => {
      const mockPolls = [
        {
          id: 'poll-1',
          question: 'Poll 1?',
          status: 'active',
          created_at: new Date('2025-01-01'),
        },
        {
          id: 'poll-2',
          question: 'Poll 2?',
          status: 'active',
          created_at: new Date('2025-01-02'),
        },
      ];

      mockPrismaClient.poll.findMany.mockResolvedValue(mockPolls);

      const result = await pollsService.getActivePolls();

      expect(mockPrismaClient.poll.findMany).toHaveBeenCalledWith({
        where: { status: 'active' },
        include: {
          options: true,
          _count: { select: { votes: true } },
        },
        orderBy: { created_at: 'desc' },
      });

      expect(result).toEqual(mockPolls);
    });

    it('should get user voting history', async () => {
      const userId = 'user-123';
      const mockVotes = [
        {
          poll_id: 'poll-1',
          option_id: 'opt-1',
          voted_at: new Date(),
          poll: { question: 'Test poll?' },
          option: { option_text: 'Yes' },
        },
      ];

      mockPrismaClient.vote.findMany.mockResolvedValue(mockVotes);

      const result = await pollsService.getUserVotingHistory(userId);

      expect(mockPrismaClient.vote.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        include: {
          poll: { select: { question: true, status: true } },
          option: { select: { option_text: true } },
        },
        orderBy: { voted_at: 'desc' },
      });

      expect(result).toEqual(mockVotes);
    });
  });
});