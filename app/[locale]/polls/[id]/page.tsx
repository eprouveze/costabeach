"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { PollCard } from "@/components/PollCard";
import { ArrowLeft, Calendar, Users, BarChart3, Clock, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";

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
  created_by?: string;
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

export default function PollDetailPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const pollId = params?.id as string;
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [statistics, setStatistics] = useState<PollStatistics | null>(null);
  const [userVote, setUserVote] = useState<{ poll_id: string; option_ids: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pollId) {
      loadPoll();
    }
  }, [pollId]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load poll details
      const pollResponse = await fetch(`/api/polls/${pollId}`);
      if (!pollResponse.ok) {
        throw new Error('Poll not found');
      }
      const pollData = await pollResponse.json();
      setPoll(pollData);

      // Load statistics if poll is closed or user has voted
      const hasVoted = await checkUserVote();
      if (pollData.status === 'closed' || hasVoted) {
        await loadStatistics();
      }

    } catch (error) {
      console.error('Error loading poll:', error);
      setError(error instanceof Error ? error.message : 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const checkUserVote = async (): Promise<boolean> => {
    if (!session?.user) return false;
    
    try {
      const response = await fetch(`/api/polls/${pollId}/user-vote`);
      if (response.ok) {
        const data = await response.json();
        if (data.vote) {
          setUserVote({ poll_id: pollId, option_ids: data.vote.option_ids });
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking user vote:', error);
    }
    return false;
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`/api/polls/${pollId}/statistics`);
      if (response.ok) {
        const stats = await response.json();
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleVote = async (optionIds: string[], explanation?: string) => {
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

      // Update user vote and load statistics
      setUserVote({ poll_id: pollId, option_ids: optionIds });
      await loadStatistics();
      
      toast.success(t("polls.voteSubmitted") || "Vote submitted successfully!");
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const dateLocale = locale === "fr" ? fr : locale === "ar" ? ar : enUS;
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: dateLocale
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'single_choice': return t("polls.singleChoice") || "Single Choice";
      case 'multiple_choice': return t("polls.multipleChoice") || "Multiple Choice";
      default: return type;
    }
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

  if (error || !poll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </button>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">{t("common.error") || "Error"}</p>
          <p>{error || "Poll not found"}</p>
          <button 
            onClick={loadPoll}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
          >
            {t("common.retry") || "Retry"}
          </button>
        </div>
      </div>
    );
  }

  const hasVoted = !!userVote;
  const shouldShowResults = poll.status === 'closed' || hasVoted;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("common.back")}
        </button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("polls.pollDetails") || "Poll Details"}
            </h1>
            <p className="text-gray-600">
              {t("polls.detailsDescription") || "View poll information and results"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Poll Card */}
        <div className="lg:col-span-2">
          <PollCard
            poll={poll}
            statistics={statistics || undefined}
            hasVoted={hasVoted}
            canVote={!!session?.user}
            onVote={handleVote}
            showResults={shouldShowResults}
          />
        </div>

        {/* Poll Information Sidebar */}
        <div className="space-y-6">
          {/* Status and Type Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">{t("polls.pollInfo") || "Poll Information"}</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t("polls.status") || "Status"}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(poll.status)}`}>
                  {t(`polls.status.${poll.status}`) || poll.status}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">{t("polls.type") || "Type"}</p>
                <p className="font-medium">{getTypeDisplay(poll.poll_type)}</p>
              </div>
              
              {poll.max_choices && poll.poll_type === 'multiple_choice' && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("polls.maxChoices") || "Max Choices"}</p>
                  <p className="font-medium">{poll.max_choices}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500 mb-1">{t("polls.anonymous") || "Anonymous"}</p>
                <p className="font-medium">{poll.is_anonymous ? t("common.yes") || "Yes" : t("common.no") || "No"}</p>
              </div>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">{t("polls.timeline") || "Timeline"}</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">{t("polls.created") || "Created"}</p>
                  <p className="font-medium">{formatDate(poll.created_at)}</p>
                </div>
              </div>
              
              {poll.voting_deadline && (
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("polls.deadline") || "Voting Deadline"}</p>
                    <p className="font-medium">{formatDate(poll.voting_deadline)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          {statistics && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">{t("polls.statistics") || "Statistics"}</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("polls.totalVotes") || "Total Votes"}</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.total_votes}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <BarChart3 className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("polls.options") || "Options"}</p>
                    <p className="text-2xl font-bold text-gray-900">{poll.options.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Features */}
          {poll.require_explanation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm font-medium text-blue-800">
                  {t("polls.explanationRequired") || "Explanation required for this poll"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}