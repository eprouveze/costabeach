"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/organisms/Header";
import { 
  RefreshCw, 
  Play, 
  Square, 
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  ExternalLink
} from "lucide-react";
import { toast } from "react-toastify";

interface TranslationStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

interface WorkerHealth {
  isRunning: boolean;
  lastCheck: string;
  processedCount: number;
  startedAt?: string;
}

interface CompletedTranslation {
  id: string;
  document_id: string;
  source_language: string;
  target_language: string;
  status: string;
  completed_at: string;
  created_at: string;
  documents?: {
    title: string;
    category: string;
  };
}

interface TranslationConfig {
  available: boolean;
  reason?: string;
  suggestion?: string;
  apiKeyPresent: boolean;
  apiKeyValid: boolean;
}

export default function TranslationManagementPage() {
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [health, setHealth] = useState<WorkerHealth | null>(null);
  const [config, setConfig] = useState<TranslationConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [completedTranslations, setCompletedTranslations] = useState<CompletedTranslation[]>([]);
  const [showCompletedTranslations, setShowCompletedTranslations] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/translations/worker');
      if (response.ok) {
        const data = await response.json();
        setStats(data.queue);
        setHealth(data.worker);
        setConfig(data.config);
      } else {
        throw new Error('Failed to fetch status');
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      toast.error('Failed to fetch translation status');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedTranslations = async () => {
    try {
      const response = await fetch('/api/translations?status=completed&limit=20');
      if (response.ok) {
        const data = await response.json();
        setCompletedTranslations(data.translations || []);
      } else {
        throw new Error('Failed to fetch completed translations');
      }
    } catch (error) {
      console.error('Error fetching completed translations:', error);
      toast.error('Failed to fetch completed translations');
    }
  };

  const performAction = async (action: string, jobId?: string) => {
    try {
      setActionLoading(action);
      const response = await fetch('/api/translations/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, jobId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        // Refresh status after action
        setTimeout(fetchStatus, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Action failed');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showCompletedTranslations) {
      fetchCompletedTranslations();
    }
  }, [showCompletedTranslations]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Translation Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and control the document translation system
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => performAction('process')}
              disabled={actionLoading === 'process'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {actionLoading === 'process' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Process Pending Jobs
            </button>

            <button
              onClick={() => performAction('start')}
              disabled={actionLoading === 'start'}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {actionLoading === 'start' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Start Worker
            </button>

            <button
              onClick={() => performAction('stop')}
              disabled={actionLoading === 'stop'}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {actionLoading === 'stop' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Stop Worker
            </button>

            <button
              onClick={() => performAction('retry_failed')}
              disabled={actionLoading === 'retry_failed'}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {actionLoading === 'retry_failed' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Retry Failed Jobs
            </button>

            <button
              onClick={() => performAction('recover_stalled')}
              disabled={actionLoading === 'recover_stalled'}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {actionLoading === 'recover_stalled' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Recover Stalled
            </button>

            <button
              onClick={() => performAction('cleanup_orphaned')}
              disabled={actionLoading === 'cleanup_orphaned'}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {actionLoading === 'cleanup_orphaned' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              Cleanup Orphaned
            </button>

            <button
              onClick={fetchStatus}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Status
            </button>

            <button
              onClick={() => setShowCompletedTranslations(!showCompletedTranslations)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              {showCompletedTranslations ? 'Hide' : 'View'} Completed Translations
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Configuration Status - Compact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </h2>
            
            {config ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {config.available ? 'Ready' : 'Not Configured'}
                  </span>
                </div>
                
                {!config.available && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <div className="mb-2">
                      <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                        Get API Key <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="text-xs">Add to .env.local:</div>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded block mt-1">
                      ANTHROPIC_API_KEY=sk-ant-...
                    </code>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>API Key:</span>
                    <span className={config.apiKeyPresent ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {config.apiKeyPresent ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className={config.apiKeyValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {config.apiKeyValid ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Loading...</div>
            )}
          </div>
          {/* Worker Health */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Worker Status
            </h2>
            
            {health ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${health.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">
                    {health.isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <div>Last Check: {new Date(health.lastCheck).toLocaleString()}</div>
                  <div>Processed Count: {health.processedCount}</div>
                  {health.startedAt && (
                    <div>Started At: {new Date(health.startedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
            )}
          </div>

          {/* Queue Statistics */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Queue Statistics
            </h2>
            
            {stats ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-500/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-100">
                    {stats.pending}
                  </div>
                  <div className="text-sm font-medium text-yellow-600 dark:text-yellow-200">Pending</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-100">
                    {stats.processing}
                  </div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-200">Processing</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-500/20 border border-green-200 dark:border-green-500/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-100">
                    {stats.completed}
                  </div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-200">Completed</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-100">
                    {stats.failed}
                  </div>
                  <div className="text-sm font-medium text-red-600 dark:text-red-200">Failed</div>
                </div>
                
                <div className="lg:col-span-2 text-center p-4 bg-gray-50 dark:bg-gray-500/20 border border-gray-200 dark:border-gray-500/50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-100">
                    {stats.total}
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-200">Total Jobs</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading...</div>
            )}
          </div>
        </div>

        {/* Completed Translations */}
        {showCompletedTranslations && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed Translations (Recent 20)
            </h2>
            
            {completedTranslations.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No completed translations found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Translation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {completedTranslations.map((translation) => (
                      <tr key={translation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium">{translation.documents?.title || 'Unknown Document'}</div>
                            <div className="text-gray-500 text-xs">{translation.documents?.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-1">
                            {translation.source_language}
                          </span>
                          →
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded ml-1">
                            {translation.target_language}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(translation.completed_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a 
                            href={`/fr/admin/documents`} 
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View in Documents
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How Translation Works
          </h3>
          <div className="text-blue-800 dark:text-blue-300 text-sm space-y-2">
            <p>• When documents are uploaded, translation jobs are automatically created for all supported languages</p>
            <p>• The translation worker processes these jobs in the background</p>
            <p>• Use "Process Pending Jobs" to manually trigger processing of waiting translations</p>
            <p>• Failed jobs can be retried, and stalled jobs can be recovered</p>
            <p>• Use "Cleanup Orphaned" to remove translation jobs for deleted documents</p>
            <p>• Completed translations appear as separate documents in the Documents page</p>
            <p>• The page auto-refreshes every 10 seconds to show current status</p>
          </div>
        </div>
      </main>
    </div>
  );
}