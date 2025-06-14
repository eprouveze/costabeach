"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { PollsList } from "@/components/PollsList";
import { PollCreationForm } from "@/components/PollCreationForm";
import { Plus, Settings, BarChart3, Users, Calendar, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { Header } from "@/components/organisms/Header";

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

export default function AdminPollsPage() {
  const { t, locale } = useI18n();
  const { data: session } = useSession();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ status: 'all' | 'active' | 'closed' | 'draft', search: string }>({ status: 'all', search: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
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

  // Check admin permissions
  const canManagePolls = session?.user && (
    checkPermission(userPermissions, Permission.MANAGE_WHATSAPP) ||
    (session?.user as any)?.isAdmin === true
  );

  useEffect(() => {
    if (canManagePolls) {
      loadPolls();
    }
  }, [canManagePolls, filter.status]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filter.status !== 'all') {
        params.append('status', filter.status);
      }
      // Get all polls (admin view)
      params.append('admin_view', 'true');
      
      const response = await fetch(`/api/polls?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPolls(data.polls || []);
    } catch (error) {
      console.error('Error loading polls:', error);
      setError(error instanceof Error ? error.message : 'Failed to load polls');
      toast.error(t("polls.errorLoading") || "Failed to load polls");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async (pollId: string): Promise<PollStatistics> => {
    const response = await fetch(`/api/polls/${pollId}/statistics`);
    if (!response.ok) {
      throw new Error('Failed to load poll statistics');
    }
    return response.json();
  };

  const handleCreatePoll = async (pollData: any) => {
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create poll');
      }

      const newPoll = await response.json();
      setPolls(prev => [newPoll, ...prev]);
      setShowCreateForm(false);
      toast.success(t("polls.created") || "Poll created successfully!");
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create poll');
      throw error;
    }
  };

  const handleUpdatePollStatus = async (pollId: string, status: string) => {
    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update poll');
      }

      // Update the poll in our state
      setPolls(prev => prev.map(poll => 
        poll.id === pollId ? { ...poll, status: status as any } : poll
      ));
      
      toast.success(t("polls.updated") || "Poll updated successfully!");
    } catch (error) {
      console.error('Error updating poll:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update poll');
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm(t("polls.confirmDelete") || "Are you sure you want to delete this poll?")) {
      return;
    }

    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete poll');
      }

      setPolls(prev => prev.filter(poll => poll.id !== pollId));
      toast.success(t("polls.deleted") || "Poll deleted successfully!");
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete poll');
    }
  };

  const handleFilterChange = (newFilter: { status?: 'all' | 'active' | 'closed' | 'draft'; search?: string }) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  if (!canManagePolls) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">{t("common.accessDenied") || "Access Denied"}</p>
          <p>{t("polls.adminRequired") || "You need admin permissions to manage polls."}</p>
        </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("polls.adminTitle") || "Polls Management"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t("polls.adminDescription") || "Create, manage, and monitor community polls"}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link
              href={`/${locale}/polls`}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("polls.viewPublic") || "View Public"}
            </Link>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("polls.create") || "Create Poll"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t("admin.polls.stats.totalPolls")}</p>
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
              <p className="text-sm font-medium text-gray-600">{t("admin.polls.stats.active")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {polls.filter(poll => poll.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Settings className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t("admin.polls.stats.draft")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {polls.filter(poll => poll.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t("admin.polls.stats.closed")}</p>
              <p className="text-2xl font-bold text-gray-900">
                {polls.filter(poll => poll.status === 'closed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Poll Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{t("polls.createNew") || "Create New Poll"}</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </div>
              
              <PollCreationForm
                onSubmit={handleCreatePoll}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Polls List with Admin Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {/* Admin Controls for each poll */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{t("admin.polls.adminActions")}</h3>
            
            {polls.length > 0 && (
              <div className="space-y-4">
                {polls.map((poll) => (
                  <div key={poll.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{poll.question}</h4>
                      <p className="text-sm text-gray-600">
                        {t("admin.polls.status")}: <span className="capitalize">{poll.status}</span> | 
                        {t("admin.polls.votes")}: {poll._count?.votes || 0}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {poll.status === 'draft' && (
                        <button
                          onClick={() => handleUpdatePollStatus(poll.id, 'active')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          {t("admin.polls.actions.activate")}
                        </button>
                      )}
                      
                      {poll.status === 'active' && (
                        <button
                          onClick={() => handleUpdatePollStatus(poll.id, 'closed')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          {t("admin.polls.actions.close")}
                        </button>
                      )}
                      
                      <Link
                        href={`/${locale}/polls/${poll.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleDeletePoll(poll.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Standard Polls List */}
          <PollsList
            polls={polls}
            userVotes={[]} // Admin view doesn't show user votes
            canVote={false} // Admins view-only
            showResults={true} // Always show results in admin view
            onLoadStatistics={loadStatistics}
            filter={filter}
            onFilterChange={handleFilterChange as any}
            emptyMessage={t("polls.noPolls") || "No polls created yet. Create the first one!"}
          />
        </div>
      </div>
      </div>
    </div>
  );
}