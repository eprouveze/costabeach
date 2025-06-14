"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Permission } from "@/lib/types";
import { api } from "@/lib/trpc/react";

interface OrphanedTranslation {
  id: string;
  document_id: string;
  target_language: string;
  status: string;
  created_at: Date;
  requested_by: string;
}

interface TranslationStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  failed: number;
  total_cost_cents: number;
  average_cost_cents: number;
}

export default function AdminTranslationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // tRPC queries and mutations
  const { data: translationData, refetch: refetchTranslations } = api.translations.adminGetTranslationStats.useQuery(
    undefined,
    { enabled: hasPermission }
  );

  const cleanupMutation = api.translations.adminCleanupOrphanedTranslations.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchTranslations();
    },
    onError: (error) => {
      toast.error(`Cleanup failed: ${error.message}`);
    }
  });

  const deleteMutation = api.translations.adminDeleteTranslation.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchTranslations();
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    }
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (!session?.user?.id) {
          toast.error("You must be logged in to access this page");
          router.push("/login");
          return;
        }

        // Fetch user permissions from API
        const response = await fetch(`/api/users/${session.user.id}/permissions`);
        if (!response.ok) {
          throw new Error("Failed to fetch user permissions");
        }
        
        const userData = await response.json();
        const userPermissions = userData.permissions || [];
        const isAdmin = userData.isAdmin || false;
        
        // Check if user can manage documents (required for translation management)
        const canManageTranslations = isAdmin || userPermissions.includes(Permission.MANAGE_DOCUMENTS);
        
        if (!canManageTranslations) {
          toast.error("You don't have permission to manage translations");
          router.push("/admin");
          return;
        }
        
        setHasPermission(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error verifying permissions:", error);
        toast.error("Failed to verify permissions");
        router.push("/admin");
      }
    };

    checkPermissions();
  }, [session, router]);

  const handleCleanupOrphaned = () => {
    if (window.confirm("Are you sure you want to cleanup all orphaned translations? This action cannot be undone.")) {
      cleanupMutation.mutate();
    }
  };

  const handleDeleteTranslation = (translationId: string) => {
    if (window.confirm("Are you sure you want to delete this translation? This action cannot be undone.")) {
      deleteMutation.mutate({ translationId });
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const formatLanguage = (lang: string) => {
    const languages: { [key: string]: string } = {
      'french': 'French',
      'arabic': 'Arabic', 
      'english': 'English'
    };
    return languages[lang] || lang;
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  const stats = translationData?.stats;
  const orphanedTranslations = translationData?.orphanedTranslations || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Translation Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage translation jobs and cleanup orphaned translations
        </p>
      </div>

      {/* Translation Statistics */}
      {stats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Translation Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">{stats.in_progress}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
          </div>
          
          {stats.total_cost_cents > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_cost_cents)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.average_cost_cents)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Cost</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orphaned Translations */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Orphaned Translations ({orphanedTranslations.length})
          </h2>
          {orphanedTranslations.length > 0 && (
            <button
              onClick={handleCleanupOrphaned}
              disabled={cleanupMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {cleanupMutation.isPending ? "Cleaning up..." : "Cleanup All Orphaned"}
            </button>
          )}
        </div>

        {orphanedTranslations.length === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-700 dark:text-green-300">
              ✅ No orphaned translations found. All translation jobs reference valid documents.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Translation ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Document ID (Missing)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Target Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {orphanedTranslations.map((translation: OrphanedTranslation) => (
                    <tr key={translation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                        {translation.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-red-600 dark:text-red-400">
                        {translation.document_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatLanguage(translation.target_language)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          translation.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : translation.status === 'processing'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : translation.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {translation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(translation.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteTranslation(translation.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}