// Poll Card Component
// Displays poll information with voting interface

import React from 'react';

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

interface PollCardProps {
  poll: Poll & { options: PollOption[] };
  statistics?: PollStatistics;
  hasVoted?: boolean;
  canVote?: boolean;
  onVote?: (optionIds: string[], explanation?: string) => Promise<void>;
  showResults?: boolean;
}

export function PollCard({
  poll,
  statistics,
  hasVoted = false,
  canVote = true,
  onVote,
  showResults = false,
}: PollCardProps) {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [explanation, setExplanation] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (poll.poll_type === 'single_choice') {
      setSelectedOptions(checked ? [optionId] : []);
    } else {
      if (checked) {
        const maxChoices = poll.max_choices || poll.options.length;
        if (selectedOptions.length < maxChoices) {
          setSelectedOptions([...selectedOptions, optionId]);
        } else {
          setError(`You can select a maximum of ${maxChoices} options`);
          return;
        }
      } else {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      }
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedOptions.length === 0) {
      setError('Please select at least one option');
      return;
    }

    if (poll.require_explanation && !explanation.trim()) {
      setError('Please provide an explanation for your choice');
      return;
    }

    setIsSubmitting(true);
    try {
      await onVote?.(selectedOptions, explanation.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionResult = (optionId: string) => {
    return statistics?.option_results.find(result => result.option_id === optionId);
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = poll.voting_deadline && new Date(poll.voting_deadline) <= new Date();
  const showVotingInterface = !hasVoted && canVote && poll.status === 'active' && !isExpired && !showResults;

  return (
    <div className="poll-card border rounded-lg p-6 bg-white shadow-sm">
      {/* Poll Header */}
      <div className="poll-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {poll.question}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            poll.status === 'active' ? 'bg-green-100 text-green-800' :
            poll.status === 'closed' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
          </span>
          
          <span className="text-xs text-gray-500">
            {poll.poll_type === 'single_choice' ? 'Single choice' : 
             `Multiple choice${poll.max_choices ? ` (max ${poll.max_choices})` : ''}`}
          </span>
          
          {poll.is_anonymous && (
            <span className="text-xs text-gray-500">Anonymous</span>
          )}
          
          {poll.voting_deadline && (
            <span className="text-xs text-gray-500">
              Deadline: {formatDeadline(poll.voting_deadline)}
            </span>
          )}
        </div>
      </div>

      {/* Poll Options */}
      <div className="poll-options mb-4">
        {showVotingInterface ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-4">
              {poll.options
                .sort((a, b) => a.option_order - b.option_order)
                .map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type={poll.poll_type === 'single_choice' ? 'radio' : 'checkbox'}
                      name={poll.poll_type === 'single_choice' ? 'poll-option' : undefined}
                      value={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                      className="mr-3"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-900">{option.option_text}</span>
                  </label>
                ))}
            </div>

            {poll.require_explanation && (
              <div className="mb-4">
                <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation {poll.require_explanation && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Please explain your choice..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || selectedOptions.length === 0}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
            </button>
          </form>
        ) : (
          // Show results or voted state
          <div className="space-y-3">
            {poll.options
              .sort((a, b) => a.option_order - b.option_order)
              .map((option) => {
                const result = getOptionResult(option.id);
                const percentage = result?.percentage || 0;
                
                return (
                  <div key={option.id} className="poll-result">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-900">{option.option_text}</span>
                      {statistics && (
                        <span className="text-sm text-gray-600">
                          {result?.vote_count || 0} votes ({percentage.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                    {statistics && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Poll Footer */}
      <div className="poll-footer pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            Created {new Date(poll.created_at).toLocaleDateString()}
          </span>
          
          {statistics && (
            <span>
              {statistics.total_votes} total votes
            </span>
          )}
        </div>
        
        {hasVoted && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            ✓ You have voted on this poll
          </div>
        )}
        
        {isExpired && poll.status === 'active' && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            ⏰ Voting deadline has passed
          </div>
        )}
      </div>
    </div>
  );
}