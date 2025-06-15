"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { PollsList } from "@/components/PollsList";
import { Plus, Calendar, Users, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";

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
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  // Fetch user permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}/permissions`);
          if (response.ok) {
            const data = await response.json();
            setUserPermissions(data.permissions || []);
          }
        } catch (error) {
          console.error("Error fetching user permissions:", error);
        }
      } else {
        setUserPermissions([]);
      }
    };

    fetchPermissions();
  }, [session]);

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

  // Check if user can create polls (admin or comité de suivi)
  const isAdmin = (session?.user as any)?.isAdmin === true;
  const canManageComite = checkPermission(userPermissions, Permission.MANAGE_COMITE_DOCUMENTS);
  const canCreatePolls = isAdmin || canManageComite;

  if (loading) {
    return (
      <AuthWrapper requireAuth={true}>
        <OwnerDashboardTemplate>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </OwnerDashboardTemplate>
      </AuthWrapper>
    );
  }

  if (error) {
    return (
      <AuthWrapper requireAuth={true}>
        <OwnerDashboardTemplate>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            <p className="font-bold">{t("common.error") || "Error"}</p>
            <p>{error}</p>
            <button 
              onClick={loadPolls}
              className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 rounded transition-colors"
            >
              {t("common.retry") || "Retry"}
            </button>
          </div>
        </OwnerDashboardTemplate>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requireAuth={true}>
      <OwnerDashboardTemplate>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("polls.title") || "Community Polls"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("polls.description") || "Participate in community decisions and voice your opinion"}
            </p>
          </div>
          
          {session?.user && canCreatePolls && (
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t("polls.stats.totalPolls") || "Total Polls"}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{polls.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t("polls.stats.active") || "Active Polls"}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {polls.filter(poll => poll.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t("polls.stats.yourVotes") || "Your Votes"}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userVotes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Polls List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                ? (canCreatePolls 
                    ? (t("polls.noPolls") || "No polls available. Create the first one!")
                    : (t("polls.noPollsUser") || "No polls available at the moment.")
                  )
                : (t("polls.signInToVote") || "Sign in to participate in polls")
            }
          />
        </div>
      </div>
      </OwnerDashboardTemplate>
    </AuthWrapper>
  );
}