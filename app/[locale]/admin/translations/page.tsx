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
import { useI18n } from "@/lib/i18n/client";

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
  const { t } = useI18n();
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [health, setHealth] = useState<WorkerHealth | null>(null);
  const [config, setConfig] = useState<TranslationConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [completedTranslations, setCompletedTranslations] = useState<CompletedTranslation[]>([]);
  const [showCompletedTranslations, setShowCompletedTranslations] = useState(false);

  const fetchStatus = async () => {
    const MAX_RETRIES = 3;
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        if (attempt === 0) setLoading(true);
        const response = await fetch('/api/translations/worker');
        if (response.ok) {
          const data = await response.json();
          setStats(data.queue);
          setHealth(data.worker);
          setConfig(data.config);
          return; // success
        }
        throw new Error(`Request failed: ${response.status}`);
      } catch (err) {
        attempt += 1;
        if (attempt >= MAX_RETRIES) {
          console.error('Error fetching status:', err);
          toast.error(t('toast.admin.translationStatusFetchError'));
        } else {
          // brief delay before retry
          await new Promise((res) => setTimeout(res, 1000 * attempt));
        }
      } finally {
        if (attempt === 0) setLoading(false);
      }
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
      toast.error(t('toast.admin.completedTranslationsFetchError'));
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
        // Show translated message based on action type
        let translatedMessage;
        switch (action) {
          case 'retry_failed':
            translatedMessage = t('toast.admin.failedJobsQueuedForRetry');
            break;
          default:
            translatedMessage = data.message; // Fallback to server message
        }
        toast.success(translatedMessage);
        // Refresh status after action
        setTimeout(fetchStatus, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Action failed');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(t('toast.admin.operationError', { action, error: error instanceof Error ? error.message : 'Unknown error' }));
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
            {t('admin.translationManagement')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('admin.translationDescription')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.quickActions')}
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
              {t('admin.processPendingJobs')}
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
              {t('admin.startWorker')}
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
              {t('admin.stopWorker')}
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
              {t('admin.retryFailedJobs')}
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
              {t('admin.recoverStalled')}
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
              {t('admin.cleanupOrphaned')}
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
              {t('admin.refreshStatus')}
            </button>

            <button
              onClick={() => setShowCompletedTranslations(!showCompletedTranslations)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              {showCompletedTranslations ? t('admin.hideCompletedTranslations') : t('admin.viewCompletedTranslations')}
            </button>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Configuration Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('admin.configuration')}
            </h2>
            
            {config ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">
                    {config.available ? t('admin.ready') : t('admin.notConfigured')}
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
              <div className="text-gray-500 text-sm">{t('common.loading')}</div>
            )}
          </div>

          {/* Worker Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t('admin.workerStatus')}
            </h2>
            
            {health ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${health.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-base font-medium text-gray-900 dark:text-white">
                    {health.isRunning ? t('admin.running') : t('admin.stopped')}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Last Check: {new Date(health.lastCheck).toLocaleString()}</div>
                  <div>Processed: {health.processedCount}</div>
                  {health.startedAt && (
                    <div>Started: {new Date(health.startedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">{t('common.loading')}</div>
            )}
          </div>

          {/* Queue Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('admin.queueSummary')}
            </h2>
            
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base text-gray-600 dark:text-gray-400">{t('admin.totalJobs')}</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base text-amber-600 dark:text-amber-400">{t('admin.pending')}</span>
                  <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base text-blue-600 dark:text-blue-400">{t('admin.processing')}</span>
                  <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{stats.processing}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base text-green-600 dark:text-green-400">{t('admin.completed')}</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">{stats.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base text-red-600 dark:text-red-400">{t('admin.failed')}</span>
                  <span className="text-lg font-semibold text-red-600 dark:text-red-400">{stats.failed}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">{t('common.loading')}</div>
            )}
          </div>
        </div>

        {/* Completed Translations */}
        {showCompletedTranslations && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {t('admin.completedTranslationsRecent')}
            </h2>
            
            {completedTranslations.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                {t('admin.noCompletedTranslationsFound')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.document')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.translation')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.completed')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('admin.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {completedTranslations.map((translation) => (
                      <tr key={translation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium">{translation.documents?.title || t('admin.unknownDocument')}</div>
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
                            {t('admin.viewInDocuments')}
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
            {t('admin.howTranslationWorks')}
          </h3>
          <div className="text-blue-800 dark:text-blue-300 text-sm space-y-2">
            <p>{t('admin.translationInstructions.autoCreated')}</p>
            <p>{t('admin.translationInstructions.backgroundProcessing')}</p>
            <p>{t('admin.translationInstructions.manualProcessing')}</p>
            <p>{t('admin.translationInstructions.retryFailed')}</p>
            <p>{t('admin.translationInstructions.cleanupOrphaned')}</p>
            <p>{t('admin.translationInstructions.completedDocuments')}</p>
            <p>{t('admin.translationInstructions.autoRefresh')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}