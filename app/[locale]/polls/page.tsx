"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { PollsList } from "@/components/PollsList";
import { Plus, Calendar, Users, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useSession } from "next-auth/react";

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

export default function PollsPage() {
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<{ poll_id: string; option_ids: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ status: 'all' | 'active' | 'closed' | 'draft', search: string }>({ status: 'all', search: '' });

  // Load polls
  useEffect(() => {
    loadPolls();
  }, [filter.status, filter.search]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
if (filter.status !== 'all') {
     params.append('status', filter.status);
   }
  if (filter.search.trim()) {
    params.append('search', filter.search.trim());
  }
      
      const response = await fetch(`/api/polls?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPolls(data.polls || []);
      
      // Load user votes if available
      if (session?.user) {
        loadUserVotes();
      }
    } catch (error) {
      console.error('Error loading polls:', error);
      setError(error instanceof Error ? error.message : 'Failed to load polls');
      toast.error(t("polls.errorLoading") || "Failed to load polls");
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    try {
      const response = await fetch('/api/polls/user-votes');
      if (response.ok) {
        const data = await response.json();
        setUserVotes(data.votes || []);
      }
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const loadStatistics = async (pollId: string): Promise<PollStatistics> => {
    const response = await fetch(`/api/polls/${pollId}/statistics`);
    if (!response.ok) {
      throw new Error('Failed to load poll statistics');
    }
    return response.json();
  };

  const handleVote = async (pollId: string, optionIds: string[], explanation?: string) => {
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ option_ids: optionIds, explanation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vote');
      }

      // Update user votes
      setUserVotes(prev => [
        ...prev.filter(vote => vote.poll_id !== pollId),
        { poll_id: pollId, option_ids: optionIds }
      ]);
      
      toast.success(t("polls.voteSubmitted") || "Vote submitted successfully!");
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error; // Re-throw to let PollCard handle the error display
    }
  };

  const handleFilterChange = (newFilter: { status?: 'all' | 'active' | 'closed' | 'draft'; search?: string }) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">{t("common.error") || "Error"}</p>
          <p>{error}</p>
          <button 
            onClick={loadPolls}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
          >
            {t("common.retry") || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("polls.title") || "Community Polls"}
            </h1>
            <p className="text-gray-600">
              {t("polls.description") || "Participate in community decisions and voice your opinion"}
            </p>
          </div>
          
          {session?.user && (
            <Link
              href={`/${locale}/polls/create`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("polls.create") || "Create Poll"}
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Polls</p>
              <p className="text-2xl font-bold text-gray-900">{polls.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Polls</p>
              <p className="text-2xl font-bold text-gray-900">
                {polls.filter(poll => poll.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Your Votes</p>
              <p className="text-2xl font-bold text-gray-900">{userVotes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Polls List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <PollsList
            polls={polls}
            userVotes={userVotes}
            canVote={!!session?.user}
            onVote={handleVote}
            onLoadStatistics={loadStatistics}
            filter={filter}
            onFilterChange={handleFilterChange as any}
            emptyMessage={
              session?.user 
                ? (t("polls.noPolls") || "No polls available. Create the first one!")
                : (t("polls.signInToVote") || "Sign in to participate in polls")
            }
          />
        </div>
      </div>
    </div>
  );
}