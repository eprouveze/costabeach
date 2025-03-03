"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { 
  FileText, 
  ArrowLeft, 
  Clock, 
  Filter, 
  ChevronDown, 
  User, 
  Search, 
  Plus, 
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/shared";
import { useRTL } from "@/lib/hooks/useRTL";

export default function DocumentLogsPage() {
  const { t } = useI18n();
  const rtl = useRTL();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const pageSize = 20;

  // Get audit logs from API
  const { data, isLoading, refetch, isRefetching } = api.documents.getDocumentAuditLogs.useQuery(
    {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    },
    {
      refetchOnWindowFocus: false
    }
  );

  // Filter logs based on search query and selected action
  const filteredLogs = data?.logs.filter(log => {
    let matchesSearch = true;
    let matchesAction = true;
    
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      const details = log.details as any;
      matchesSearch = 
        details?.title?.toLowerCase().includes(term) || 
        log.user.name?.toLowerCase().includes(term) || 
        log.user.email?.toLowerCase().includes(term) ||
        false;
    }
    
    if (selectedAction) {
      matchesAction = log.action === selectedAction;
    }
    
    return matchesSearch && matchesAction;
  }) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const actionTypeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'view':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      case 'download':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'translate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4" />;
      case 'update':
        return <FileText className="h-4 w-4" />;
      case 'delete':
        return <FileText className="h-4 w-4" />;
      case 'view':
        return <FileText className="h-4 w-4" />;
      case 'download':
        return <FileText className="h-4 w-4" />;
      case 'translate':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link 
            href="/admin/documents" 
            className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("admin.documentActivityLogs")}
          </h1>
        </div>

        {/* Search and filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("admin.searchLogsPlaceholder")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t("common.search")}
              </button>
            </form>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filters")}
                <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => refetch()}
                className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("admin.actionType")}
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t("admin.allActions")}</option>
                  <option value="create">{t("admin.actions.create")}</option>
                  <option value="update">{t("admin.actions.update")}</option>
                  <option value="delete">{t("admin.actions.delete")}</option>
                  <option value="view">{t("admin.actions.view")}</option>
                  <option value="download">{t("admin.actions.download")}</option>
                  <option value="translate">{t("admin.actions.translate")}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Audit logs table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mr-2" />
            <span>{t("common.loading")}</span>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.timestamp")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.user")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.action")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.document")}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t("admin.details")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLogs.map((log) => {
                    const details = log.details as any;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {formatDate(new Date(log.createdAt))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{log.user.name || log.user.email || 'Unknown user'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionTypeColor(log.action)}`}>
                            {getActionIcon(log.action)}
                            <span className="ml-1">{t(`admin.actions.${log.action}`)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-400" />
                            <Link 
                              href={`/admin/documents/${log.entityId}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {details?.title || t("admin.documentId", { id: log.entityId })}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {details && (
                            <div>
                              {details.category && (
                                <div>
                                  <span className="font-medium">{t("documents.category")}:</span> {t(`documents.categories.${details.category}`)}
                                </div>
                              )}
                              {details.language && (
                                <div>
                                  <span className="font-medium">{t("documents.language")}:</span> {t(`common.languages.${details.language.toLowerCase()}`)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("admin.noLogsFound")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              {t("admin.noLogsDescription")}
            </p>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > pageSize && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md mr-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.previous")}
              </button>
              {Array.from({ length: Math.ceil(data.total / pageSize) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded-md mx-1 ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(data.total / pageSize)}
                className="px-3 py-1 rounded-md ml-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.next")}
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 