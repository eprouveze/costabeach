// Polls List Component
// Displays a list of community polls with filtering and pagination

import React from 'react';
import { PollCard } from './PollCard';

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
  _count?: {
    votes: number;
  };
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

interface PollsListProps {
  polls: Poll[];
  userVotes?: { poll_id: string; option_ids: string[] }[];
  canVote?: boolean;
  showResults?: boolean;
  onVote?: (pollId: string, optionIds: string[], explanation?: string) => Promise<void>;
  onLoadStatistics?: (pollId: string) => Promise<PollStatistics>;
  emptyMessage?: string;
  filter?: {
    status?: 'all' | 'active' | 'closed' | 'draft';
    search?: string;
  };
  onFilterChange?: (filter: { status?: string; search?: string }) => void;
}

export function PollsList({
  polls,
  userVotes = [],
  canVote = true,
  showResults = false,
  onVote,
  onLoadStatistics,
  emptyMessage = 'No polls available.',
  filter = { status: 'all', search: '' },
  onFilterChange,
}: PollsListProps) {
  const [statistics, setStatistics] = React.useState<Record<string, PollStatistics>>({});
  const [loadingStats, setLoadingStats] = React.useState<Set<string>>(new Set());

  // Filter polls based on current filter
  const filteredPolls = React.useMemo(() => {
    let filtered = [...polls];

    // Filter by status
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(poll => poll.status === filter.status);
    }

    // Filter by search query
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(poll => 
        poll.question.toLowerCase().includes(searchLower) ||
        poll.options.some(option => option.option_text.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filtered;
  }, [polls, filter]);

  // Load statistics for a poll
  const loadPollStatistics = async (pollId: string) => {
    if (statistics[pollId] || loadingStats.has(pollId) || !onLoadStatistics) {
      return;
    }

    setLoadingStats(prev => new Set(prev).add(pollId));
    
    try {
      const stats = await onLoadStatistics(pollId);
      setStatistics(prev => ({ ...prev, [pollId]: stats }));
    } catch (error) {
      console.error('Failed to load poll statistics:', error);
    } finally {
      setLoadingStats(prev => {
        const newSet = new Set(prev);
        newSet.delete(pollId);
        return newSet;
      });
    }
  };

  // Load statistics for visible polls
  React.useEffect(() => {
    if (showResults || userVotes.length > 0) {
      filteredPolls.forEach(poll => {
        const hasVoted = userVotes.some(vote => vote.poll_id === poll.id);
        if (showResults || hasVoted || poll.status === 'closed') {
          loadPollStatistics(poll.id);
        }
      });
    }
  }, [filteredPolls, showResults, userVotes]);

  const handleVote = async (pollId: string, optionIds: string[], explanation?: string) => {
    if (!onVote) return;
    
    try {
      await onVote(pollId, optionIds, explanation);
      // Reload statistics after voting
      if (onLoadStatistics) {
        const stats = await onLoadStatistics(pollId);
        setStatistics(prev => ({ ...prev, [pollId]: stats }));
      }
    } catch (error) {
      throw error; // Re-throw to let PollCard handle the error display
    }
  };

  const getUserVoteForPoll = (pollId: string) => {
    return userVotes.find(vote => vote.poll_id === pollId);
  };

  return (
    <div className="polls-list">
      {/* Filter Controls */}
      {onFilterChange && (
        <div className="polls-filter mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={filter.status || 'all'}
                onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Polls</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Search Filter */}
            <div className="flex-2">
              <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                id="search-filter"
                type="text"
                value={filter.search || ''}
                onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
                placeholder="Search polls and options..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Polls List */}
      {filteredPolls.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Polls Found</h3>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPolls.map((poll) => {
            const userVote = getUserVoteForPoll(poll.id);
            const hasVoted = !!userVote;
            const pollStats = statistics[poll.id];
            const shouldShowResults = showResults || hasVoted || poll.status === 'closed';

            return (
              <PollCard
                key={poll.id}
                poll={poll}
                statistics={pollStats}
                hasVoted={hasVoted}
                canVote={canVote}
                onVote={(optionIds, explanation) => handleVote(poll.id, optionIds, explanation)}
                showResults={shouldShowResults}
              />
            );
          })}
        </div>
      )}

      {/* Loading States */}
      {loadingStats.size > 0 && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500">
            Loading poll statistics...
          </div>
        </div>
      )}
    </div>
  );
}