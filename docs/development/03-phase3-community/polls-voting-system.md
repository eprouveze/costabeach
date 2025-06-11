# Polls & Voting System

## 🎯 Overview

Phase 3 introduces a comprehensive community polling and voting system, enabling HOA committees to create polls, gather owner feedback, and make data-driven decisions. The system supports multilingual polls, anonymous voting, and real-time results.

## 🗳️ System Architecture

### Database Schema Implementation

**Key Tables** (from complete schema):
```sql
-- Community polls with multilingual support
polls (id, question, description, poll_type, status, is_anonymous, created_by, start_date, end_date)
poll_options (id, poll_id, option_text, order_index)
votes (id, poll_id, option_id, user_id, comment, created_at)
poll_translations (id, poll_id, language, question, description)
```

### Core API Implementation

**Create**: `src/lib/api/routers/polls.ts`
```typescript
import { z } from 'zod';
import { router, procedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const pollsRouter = router({
  // Create poll (contentEditor/admin only)
  create: procedure
    .input(z.object({
      question: z.string().min(10).max(500),
      description: z.string().optional(),
      options: z.array(z.string().min(1).max(200)).min(2).max(10),
      pollType: z.enum(['single_choice', 'multiple_choice', 'yes_no', 'rating']).default('single_choice'),
      isAnonymous: z.boolean().default(true),
      allowComments: z.boolean().default(false),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      translations: z.record(z.enum(['fr', 'ar']), z.object({
        question: z.string(),
        description: z.string().optional(),
        options: z.array(z.string()),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Permission check
      if (!['contentEditor', 'admin'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only content editors and admins can create polls',
        });
      }
      
      // Create poll with options and translations
      const { data: poll } = await ctx.supabase
        .from('polls')
        .insert({
          question: input.question,
          description: input.description,
          poll_type: input.pollType,
          is_anonymous: input.isAnonymous,
          allow_comments: input.allowComments,
          start_date: input.startDate?.toISOString(),
          end_date: input.endDate?.toISOString(),
          created_by: ctx.user.id,
          status: 'published',
        })
        .select()
        .single();
      
      // Create poll options
      const pollOptions = input.options.map((option, index) => ({
        poll_id: poll.id,
        option_text: option,
        order_index: index,
      }));
      
      await ctx.supabase.from('poll_options').insert(pollOptions);
      
      // Create translations if provided
      if (input.translations) {
        const translationEntries = Object.entries(input.translations).map(([lang, content]) => ({
          poll_id: poll.id,
          language: lang,
          question: content.question,
          description: content.description,
        }));
        
        await ctx.supabase.from('poll_translations').insert(translationEntries);
      }
      
      return poll;
    }),

  // Vote on poll
  vote: procedure
    .input(z.object({
      pollId: z.string(),
      optionIds: z.array(z.string()).min(1),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { pollId, optionIds, comment } = input;
      
      // Validate poll and user permissions
      const { data: poll } = await ctx.supabase
        .from('polls')
        .select('id, status, poll_type, end_date')
        .eq('id', pollId)
        .single();
      
      if (!poll || poll.status !== 'published') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Poll is not available for voting',
        });
      }
      
      // Check for existing vote
      const { data: existingVote } = await ctx.supabase
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', ctx.user.id)
        .single();
      
      if (existingVote) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You have already voted on this poll',
        });
      }
      
      // Create vote entries
      const votes = optionIds.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        user_id: ctx.user.id,
        comment: comment || null,
      }));
      
      await ctx.supabase.from('votes').insert(votes);
      
      return { success: true, voteCount: votes.length };
    }),

  // Get poll results
  getResults: procedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const { data: results } = await ctx.supabase
        .from('poll_options')
        .select(`
          id, option_text, order_index,
          vote_count:votes(count)
        `)
        .eq('poll_id', input)
        .order('order_index');
      
      const { count: totalVotes } = await ctx.supabase
        .from('votes')
        .select('*', { count: 'exact' })
        .eq('poll_id', input);
      
      return { options: results, totalVotes };
    }),
});
```

## 🎨 Poll UI Components

### Poll Creation Interface

**Create**: `src/components/PollCreator.tsx`
```typescript
import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Plus, X, Save } from 'lucide-react';
import { useTranslation } from 'next-intl';
import { trpc } from '@/lib/trpc';

export const PollCreator: React.FC = () => {
  const { t } = useTranslation();
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [pollType, setPollType] = useState<'single_choice' | 'multiple_choice'>('single_choice');
  
  const createPoll = trpc.polls.create.useMutation();
  
  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };
  
  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };
  
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      return;
    }
    
    try {
      await createPoll.mutateAsync({
        question,
        description,
        options: validOptions,
        pollType,
        isAnonymous: true,
        allowComments: true,
      });
      
      // Reset form
      setQuestion('');
      setDescription('');
      setOptions(['', '']);
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('polls.question')}
        </label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('polls.questionPlaceholder')}
          className="w-full"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('polls.description')} ({t('common.optional')})
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('polls.descriptionPlaceholder')}
          className="w-full border rounded-md px-3 py-2 h-20"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('polls.type')}
        </label>
        <select
          value={pollType}
          onChange={(e) => setPollType(e.target.value as any)}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="single_choice">{t('polls.singleChoice')}</option>
          <option value="multiple_choice">{t('polls.multipleChoice')}</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('polls.options')}
        </label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={t('polls.optionPlaceholder', { number: index + 1 })}
                className="flex-1"
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {options.length < 10 && (
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('polls.addOption')}
          </Button>
        )}
      </div>
      
      <Button
        type="submit"
        disabled={createPoll.isLoading || !question || options.filter(o => o.trim()).length < 2}
        className="w-full"
      >
        {createPoll.isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {t('polls.creating')}
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            {t('polls.createPoll')}
          </>
        )}
      </Button>
    </form>
  );
};
```

### Poll Voting Interface

**Create**: `src/components/PollVoter.tsx`
```typescript
import React, { useState } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { CheckCircle, BarChart3, MessageSquare } from 'lucide-react';
import { useTranslation } from 'next-intl';
import { trpc } from '@/lib/trpc';

interface PollVoterProps {
  poll: {
    id: string;
    question: string;
    description?: string;
    poll_type: string;
    status: string;
    is_anonymous: boolean;
    allow_comments: boolean;
    end_date?: string;
    options: Array<{
      id: string;
      option_text: string;
      order_index: number;
    }>;
  };
  hasVoted?: boolean;
  onVoteSubmitted?: () => void;
}

export const PollVoter: React.FC<PollVoterProps> = ({
  poll,
  hasVoted = false,
  onVoteSubmitted,
}) => {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [showResults, setShowResults] = useState(hasVoted);
  
  const voteMutation = trpc.polls.vote.useMutation({
    onSuccess: () => {
      setShowResults(true);
      onVoteSubmitted?.();
    },
  });
  
  const { data: results } = trpc.polls.getResults.useQuery(poll.id, {
    enabled: showResults,
  });
  
  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (poll.poll_type === 'single_choice') {
      setSelectedOptions(checked ? [optionId] : []);
    } else {
      setSelectedOptions(prev =>
        checked
          ? [...prev, optionId]
          : prev.filter(id => id !== optionId)
      );
    }
  };
  
  const handleVote = async () => {
    if (selectedOptions.length === 0) return;
    
    try {
      await voteMutation.mutateAsync({
        pollId: poll.id,
        optionIds: selectedOptions,
        comment: comment || undefined,
      });
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };
  
  const isExpired = poll.end_date && new Date(poll.end_date) < new Date();
  const canVote = !hasVoted && !isExpired && poll.status === 'published';
  
  return (
    <div className="border rounded-lg p-6 bg-white">
      {/* Poll Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{poll.question}</h3>
          <div className="flex items-center space-x-2">
            {poll.status === 'published' && (
              <Badge variant="success">{t('polls.status.active')}</Badge>
            )}
            {hasVoted && (
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('polls.voted')}
              </Badge>
            )}
          </div>
        </div>
        
        {poll.description && (
          <p className="text-gray-600 text-sm mb-3">{poll.description}</p>
        )}
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>{t(`polls.type.${poll.poll_type}`)}</span>
          {poll.is_anonymous && <span>{t('polls.anonymous')}</span>}
          {poll.end_date && (
            <span>
              {t('polls.endsOn')}: {new Date(poll.end_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      {/* Voting Interface */}
      {!showResults && canVote && (
        <div className="space-y-4">
          <div className="space-y-3">
            {poll.options
              .sort((a, b) => a.order_index - b.order_index)
              .map((option) => (
                <label
                  key={option.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type={poll.poll_type === 'single_choice' ? 'radio' : 'checkbox'}
                    name={poll.poll_type === 'single_choice' ? 'poll-option' : undefined}
                    checked={selectedOptions.includes(option.id)}
                    onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                    className="mr-3"
                  />
                  <span className="flex-1">{option.option_text}</span>
                </label>
              ))}
          </div>
          
          {poll.allow_comments && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('polls.comment')} ({t('common.optional')})
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('polls.commentPlaceholder')}
                className="w-full border rounded-md px-3 py-2 h-20 text-sm"
                maxLength={500}
              />
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowResults(true)}
              className="text-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('polls.viewResults')}
            </Button>
            
            <Button
              onClick={handleVote}
              disabled={selectedOptions.length === 0 || voteMutation.isLoading}
            >
              {voteMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('polls.voting')}
                </>
              ) : (
                t('polls.submitVote')
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Results Display */}
      {showResults && results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{t('polls.results')}</h4>
            <span className="text-sm text-gray-600">
              {t('polls.totalVotes', { count: results.totalVotes })}
            </span>
          </div>
          
          <div className="space-y-3">
            {results.options.map((option) => {
              const percentage = results.totalVotes > 0
                ? (option.vote_count / results.totalVotes) * 100
                : 0;
              
              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{option.option_text}</span>
                    <span className="text-sm text-gray-600">
                      {option.vote_count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {!hasVoted && canVote && (
            <Button
              variant="outline"
              onClick={() => setShowResults(false)}
              className="w-full text-sm"
            >
              {t('polls.backToVoting')}
            </Button>
          )}
        </div>
      )}
      
      {/* Status Messages */}
      {isExpired && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-sm text-gray-600">{t('polls.expired')}</p>
        </div>
      )}
      
      {hasVoted && !showResults && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-800">{t('polls.thankYou')}</p>
        </div>
      )}
    </div>
  );
};
```

## 🧪 Testing Strategy

### Poll Component Tests

**Create**: `src/components/PollVoter.test.tsx`
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PollVoter } from './PollVoter';
import { EnhancedStoryProviders } from '../stories/utils/EnhancedStoryProviders';

const mockPoll = {
  id: 'poll-1',
  question: 'Should we install a new playground?',
  description: 'Vote on the proposed playground installation',
  poll_type: 'single_choice' as const,
  status: 'published',
  is_anonymous: true,
  allow_comments: true,
  end_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  options: [
    { id: 'opt1', option_text: 'Yes, install it', order_index: 0 },
    { id: 'opt2', option_text: 'No, not needed', order_index: 1 },
    { id: 'opt3', option_text: 'Need more information', order_index: 2 },
  ],
};

const mockResults = {
  options: [
    { id: 'opt1', option_text: 'Yes, install it', vote_count: 15 },
    { id: 'opt2', option_text: 'No, not needed', vote_count: 5 },
    { id: 'opt3', option_text: 'Need more information', vote_count: 3 },
  ],
  totalVotes: 23,
};

// Mock tRPC
jest.mock('@/lib/trpc', () => ({
  trpc: {
    polls: {
      vote: {
        useMutation: () => ({
          mutateAsync: jest.fn(),
          isLoading: false,
        }),
      },
      getResults: {
        useQuery: () => ({
          data: mockResults,
        }),
      },
    },
  },
}));

const renderPollVoter = (props = {}) => {
  return render(
    <EnhancedStoryProviders withI18n withTRPC>
      <PollVoter poll={mockPoll} {...props} />
    </EnhancedStoryProviders>
  );
};

describe('PollVoter', () => {
  describe('Poll Display', () => {
    it('renders poll question and description', () => {
      renderPollVoter();
      
      expect(screen.getByText('Should we install a new playground?')).toBeInTheDocument();
      expect(screen.getByText('Vote on the proposed playground installation')).toBeInTheDocument();
    });

    it('displays poll options for voting', () => {
      renderPollVoter();
      
      expect(screen.getByText('Yes, install it')).toBeInTheDocument();
      expect(screen.getByText('No, not needed')).toBeInTheDocument();
      expect(screen.getByText('Need more information')).toBeInTheDocument();
    });

    it('shows active status badge', () => {
      renderPollVoter();
      
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
  });

  describe('Voting Functionality', () => {
    it('allows selecting options for single choice poll', async () => {
      renderPollVoter();
      
      const option1 = screen.getByLabelText('Yes, install it');
      const option2 = screen.getByLabelText('No, not needed');
      
      fireEvent.click(option1);
      expect(option1).toBeChecked();
      
      fireEvent.click(option2);
      expect(option2).toBeChecked();
      expect(option1).not.toBeChecked(); // Single choice, so previous deselected
    });

    it('allows adding comments when enabled', () => {
      renderPollVoter();
      
      const commentBox = screen.getByPlaceholderText(/comment/i);
      fireEvent.change(commentBox, { target: { value: 'Great idea for the community!' } });
      
      expect(commentBox).toHaveValue('Great idea for the community!');
    });

    it('enables submit button when option is selected', () => {
      renderPollVoter();
      
      const submitButton = screen.getByText(/submit vote/i);
      expect(submitButton).toBeDisabled();
      
      const option1 = screen.getByLabelText('Yes, install it');
      fireEvent.click(option1);
      
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Results Display', () => {
    it('shows results when user has voted', () => {
      renderPollVoter({ hasVoted: true });
      
      expect(screen.getByText(/results/i)).toBeInTheDocument();
      expect(screen.getByText('15 (65.2%)')).toBeInTheDocument(); // Yes votes
      expect(screen.getByText('5 (21.7%)')).toBeInTheDocument();  // No votes
      expect(screen.getByText('3 (13.0%)')).toBeInTheDocument();  // More info votes
    });

    it('displays total vote count', () => {
      renderPollVoter({ hasVoted: true });
      
      expect(screen.getByText(/23.*votes/i)).toBeInTheDocument();
    });

    it('shows visual progress bars for results', () => {
      renderPollVoter({ hasVoted: true });
      
      const progressBars = screen.getAllByRole('progressbar', { hidden: true });
      expect(progressBars).toHaveLength(3); // One for each option
    });
  });

  describe('Poll States', () => {
    it('shows voted badge when user has voted', () => {
      renderPollVoter({ hasVoted: true });
      
      expect(screen.getByText(/voted/i)).toBeInTheDocument();
    });

    it('handles expired polls', () => {
      const expiredPoll = {
        ...mockPoll,
        end_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      };
      
      renderPollVoter({ poll: expiredPoll });
      
      expect(screen.getByText(/expired/i)).toBeInTheDocument();
    });

    it('allows viewing results without voting', async () => {
      renderPollVoter();
      
      const viewResultsButton = screen.getByText(/view results/i);
      fireEvent.click(viewResultsButton);
      
      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper form labels', () => {
      renderPollVoter();
      
      expect(screen.getByLabelText('Yes, install it')).toBeInTheDocument();
      expect(screen.getByLabelText('No, not needed')).toBeInTheDocument();
      expect(screen.getByLabelText('Need more information')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      renderPollVoter();
      
      const firstOption = screen.getByLabelText('Yes, install it');
      firstOption.focus();
      expect(firstOption).toHaveFocus();
    });
  });

  describe('Multiple Choice Polls', () => {
    it('allows selecting multiple options', () => {
      const multipleChoicePoll = {
        ...mockPoll,
        poll_type: 'multiple_choice' as const,
      };
      
      renderPollVoter({ poll: multipleChoicePoll });
      
      const option1 = screen.getByLabelText('Yes, install it');
      const option2 = screen.getByLabelText('No, not needed');
      
      fireEvent.click(option1);
      fireEvent.click(option2);
      
      expect(option1).toBeChecked();
      expect(option2).toBeChecked(); // Both should remain checked
    });
  });
});
```

## 🎯 Success Criteria

### Functional Requirements ✅
- [ ] Create polls with multiple choice types (single, multiple, yes/no, rating)
- [ ] Anonymous voting with one vote per user enforcement
- [ ] Real-time results display with percentage calculations
- [ ] Multilingual poll support (FR/AR/EN)
- [ ] Comment functionality on votes
- [ ] Poll scheduling and expiration

### User Experience Requirements ✅
- [ ] Intuitive poll creation interface for content editors
- [ ] Clear voting interface with progress indication
- [ ] Visual results display with charts and percentages
- [ ] Mobile-responsive design for all poll interactions
- [ ] Accessibility compliance (WCAG 2.1)

### Performance Requirements ✅
- [ ] Poll creation: <2 seconds response time
- [ ] Voting submission: <500ms response time
- [ ] Results loading: <300ms for typical polls
- [ ] Real-time updates: <1 second for result changes
- [ ] Support for 300+ concurrent voters

### Security Requirements ✅
- [ ] Role-based poll creation (contentEditor/admin only)
- [ ] One vote per user enforcement
- [ ] Anonymous voting privacy protection
- [ ] Vote integrity validation
- [ ] Audit trail for all poll activities

### Integration Requirements ✅
- [ ] Notification system integration for new polls
- [ ] Admin dashboard integration for poll management
- [ ] Analytics integration for community engagement metrics
- [ ] WhatsApp integration for poll notifications (Phase 4)

---

This polls and voting system provides a comprehensive democratic decision-making tool for the HOA community while maintaining security, privacy, and ease of use across all supported languages and devices.