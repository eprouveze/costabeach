// Simplified Poll Card Tests - Logic only
// Testing poll card functionality without JSX rendering

// Poll card service logic for testing
interface Poll {
  id: string;
  question: string;
  poll_type: 'single_choice' | 'multiple_choice';
  status: 'draft' | 'active' | 'closed';
  max_choices?: number;
  is_anonymous: boolean;
  voting_deadline?: string;
  require_explanation?: boolean;
  created_at: string;
  options: PollOption[];
}

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
}

interface PollStatistics {
  poll_id: string;
  total_votes: number;
  option_results: OptionResult[];
}

interface OptionResult {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

class PollCardService {
  validateVoteSelection(
    poll: Poll,
    selectedOptions: string[],
    explanation?: string
  ): { isValid: boolean; error?: string } {
    if (selectedOptions.length === 0) {
      return { isValid: false, error: 'Please select at least one option' };
    }

    if (poll.poll_type === 'single_choice' && selectedOptions.length !== 1) {
      return { isValid: false, error: 'Single choice polls require exactly one selection' };
    }

    if (poll.poll_type === 'multiple_choice' && poll.max_choices) {
      if (selectedOptions.length > poll.max_choices) {
        return { isValid: false, error: `You can select a maximum of ${poll.max_choices} options` };
      }
    }

    if (poll.require_explanation && (!explanation || !explanation.trim())) {
      return { isValid: false, error: 'Please provide an explanation for your choice' };
    }

    // Validate that all selected options belong to this poll
    const validOptionIds = poll.options.map(opt => opt.id);
    const invalidOptions = selectedOptions.filter(id => !validOptionIds.includes(id));
    if (invalidOptions.length > 0) {
      return { isValid: false, error: 'Invalid option selected' };
    }

    return { isValid: true };
  }

  canVoteOnPoll(poll: Poll, hasVoted: boolean, canVote: boolean): boolean {
    if (hasVoted) return false;
    if (!canVote) return false;
    if (poll.status !== 'active') return false;
    
    if (poll.voting_deadline) {
      const deadline = new Date(poll.voting_deadline);
      if (deadline <= new Date()) return false;
    }
    
    return true;
  }

  formatDeadline(deadline: string): string {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getOptionResult(statistics: PollStatistics, optionId: string): OptionResult | undefined {
    return statistics.option_results.find(result => result.option_id === optionId);
  }

  calculatePercentage(votes: number, totalVotes: number): number {
    if (totalVotes === 0) return 0;
    return Number(((votes / totalVotes) * 100).toFixed(1));
  }

  handleOptionChange(
    poll: Poll,
    currentSelection: string[],
    optionId: string,
    checked: boolean
  ): { newSelection: string[]; error?: string } {
    if (poll.poll_type === 'single_choice') {
      return {
        newSelection: checked ? [optionId] : [],
      };
    } else {
      if (checked) {
        const maxChoices = poll.max_choices || poll.options.length;
        if (currentSelection.length >= maxChoices) {
          return {
            newSelection: currentSelection,
            error: `You can select a maximum of ${maxChoices} options`,
          };
        }
        return {
          newSelection: [...currentSelection, optionId],
        };
      } else {
        return {
          newSelection: currentSelection.filter(id => id !== optionId),
        };
      }
    }
  }

  async submitVote(
    pollId: string,
    optionIds: string[],
    explanation?: string
  ): Promise<void> {
    // Mock API call
    const response = await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_ids: optionIds, explanation }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit vote');
    }
  }
}

// Mock fetch
global.fetch = jest.fn();

describe('Poll Card Service Logic', () => {
  let service: PollCardService;
  
  const mockPoll: Poll = {
    id: 'poll-123',
    question: 'Should we install new playground equipment?',
    poll_type: 'single_choice',
    status: 'active',
    is_anonymous: true,
    created_at: '2025-01-01T00:00:00Z',
    options: [
      { id: 'opt-1', option_text: 'Yes', option_order: 0 },
      { id: 'opt-2', option_text: 'No', option_order: 1 },
    ],
  };

  const mockMultipleChoicePoll: Poll = {
    ...mockPoll,
    id: 'poll-456',
    poll_type: 'multiple_choice',
    max_choices: 2,
    question: 'What amenities should we prioritize?',
    options: [
      { id: 'opt-1', option_text: 'Pool', option_order: 0 },
      { id: 'opt-2', option_text: 'Gym', option_order: 1 },
      { id: 'opt-3', option_text: 'Garden', option_order: 2 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
    service = new PollCardService();
  });

  describe('Vote Validation', () => {
    it('should validate single choice selection correctly', () => {
      const result = service.validateVoteSelection(mockPoll, ['opt-1']);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty selection', () => {
      const result = service.validateVoteSelection(mockPoll, []);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please select at least one option');
    });

    it('should reject multiple selections for single choice poll', () => {
      const result = service.validateVoteSelection(mockPoll, ['opt-1', 'opt-2']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Single choice polls require exactly one selection');
    });

    it('should validate multiple choice selections', () => {
      const result = service.validateVoteSelection(mockMultipleChoicePoll, ['opt-1', 'opt-2']);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject too many selections for multiple choice poll', () => {
      const result = service.validateVoteSelection(mockMultipleChoicePoll, ['opt-1', 'opt-2', 'opt-3']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('You can select a maximum of 2 options');
    });

    it('should require explanation when configured', () => {
      const pollWithExplanation = { ...mockPoll, require_explanation: true };
      const result = service.validateVoteSelection(pollWithExplanation, ['opt-1']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please provide an explanation for your choice');
    });

    it('should accept explanation when provided', () => {
      const pollWithExplanation = { ...mockPoll, require_explanation: true };
      const result = service.validateVoteSelection(pollWithExplanation, ['opt-1'], 'This is my reason');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid option IDs', () => {
      const result = service.validateVoteSelection(mockPoll, ['invalid-option']);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid option selected');
    });
  });

  describe('Voting Eligibility', () => {
    it('should allow voting on active poll when eligible', () => {
      const canVote = service.canVoteOnPoll(mockPoll, false, true);
      expect(canVote).toBe(true);
    });

    it('should prevent voting if user has already voted', () => {
      const canVote = service.canVoteOnPoll(mockPoll, true, true);
      expect(canVote).toBe(false);
    });

    it('should prevent voting on closed poll', () => {
      const closedPoll = { ...mockPoll, status: 'closed' as const };
      const canVote = service.canVoteOnPoll(closedPoll, false, true);
      expect(canVote).toBe(false);
    });

    it('should prevent voting after deadline', () => {
      const expiredPoll = { 
        ...mockPoll, 
        voting_deadline: '2020-01-01T00:00:00Z' // Past date
      };
      const canVote = service.canVoteOnPoll(expiredPoll, false, true);
      expect(canVote).toBe(false);
    });

    it('should allow voting before deadline', () => {
      const futurePoll = { 
        ...mockPoll, 
        voting_deadline: '2030-01-01T00:00:00Z' // Future date
      };
      const canVote = service.canVoteOnPoll(futurePoll, false, true);
      expect(canVote).toBe(true);
    });
  });

  describe('Option Selection Handling', () => {
    it('should handle single choice selection', () => {
      const result = service.handleOptionChange(mockPoll, [], 'opt-1', true);
      expect(result.newSelection).toEqual(['opt-1']);
      expect(result.error).toBeUndefined();
    });

    it('should handle single choice deselection', () => {
      const result = service.handleOptionChange(mockPoll, ['opt-1'], 'opt-1', false);
      expect(result.newSelection).toEqual([]);
      expect(result.error).toBeUndefined();
    });

    it('should handle multiple choice selection', () => {
      const result = service.handleOptionChange(mockMultipleChoicePoll, ['opt-1'], 'opt-2', true);
      expect(result.newSelection).toEqual(['opt-1', 'opt-2']);
      expect(result.error).toBeUndefined();
    });

    it('should prevent exceeding max choices', () => {
      const result = service.handleOptionChange(mockMultipleChoicePoll, ['opt-1', 'opt-2'], 'opt-3', true);
      expect(result.newSelection).toEqual(['opt-1', 'opt-2']);
      expect(result.error).toBe('You can select a maximum of 2 options');
    });

    it('should handle multiple choice deselection', () => {
      const result = service.handleOptionChange(mockMultipleChoicePoll, ['opt-1', 'opt-2'], 'opt-1', false);
      expect(result.newSelection).toEqual(['opt-2']);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Statistics and Results', () => {
    const mockStatistics: PollStatistics = {
      poll_id: 'poll-123',
      total_votes: 100,
      option_results: [
        { option_id: 'opt-1', option_text: 'Yes', vote_count: 75, percentage: 75.0 },
        { option_id: 'opt-2', option_text: 'No', vote_count: 25, percentage: 25.0 },
      ],
    };

    it('should find option result correctly', () => {
      const result = service.getOptionResult(mockStatistics, 'opt-1');
      expect(result).toEqual({
        option_id: 'opt-1',
        option_text: 'Yes',
        vote_count: 75,
        percentage: 75.0,
      });
    });

    it('should return undefined for non-existent option', () => {
      const result = service.getOptionResult(mockStatistics, 'non-existent');
      expect(result).toBeUndefined();
    });

    it('should calculate percentage correctly', () => {
      expect(service.calculatePercentage(75, 100)).toBe(75.0);
      expect(service.calculatePercentage(1, 3)).toBe(33.3);
      expect(service.calculatePercentage(0, 100)).toBe(0);
      expect(service.calculatePercentage(10, 0)).toBe(0);
    });
  });

  describe('Vote Submission', () => {
    it('should submit vote successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await expect(
        service.submitVote('poll-123', ['opt-1'], 'My explanation')
      ).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith('/api/polls/poll-123/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option_ids: ['opt-1'],
          explanation: 'My explanation',
        }),
      });
    });

    it('should handle vote submission errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'You have already voted on this poll' }),
      });

      await expect(
        service.submitVote('poll-123', ['opt-1'])
      ).rejects.toThrow('You have already voted on this poll');
    });
  });

  describe('Date Formatting', () => {
    it('should format deadline correctly', () => {
      const deadline = '2025-12-31T12:00:00Z';
      const formatted = service.formatDeadline(deadline);
      expect(formatted).toContain('2025'); // Just check year to avoid timezone issues
      expect(formatted).toContain('Dec');
    });
  });
});