"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { toast } from "react-toastify";
import { Header } from "@/components/organisms/Header";
import { 
  BarChart3, 
  FileText, 
  Users, 
  MessageSquare, 
  Download, 
  Calendar,
  TrendingUp,
  Eye,
  Filter
} from "lucide-react";

export default function AdminReportsPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Check permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}/permissions`);
          if (response.ok) {
            const userData = await response.json();
            setUserPermissions(userData.permissions || []);
          }
        } catch (error) {
          console.error("Error fetching permissions:", error);
        }
      }
    };

    if (status === 'authenticated') {
      fetchPermissions();
    }
  }, [session, status]);

  const canViewReports = 
    checkPermission(userPermissions, Permission.VIEW_AUDIT_LOGS) ||
    checkPermission(userPermissions, Permission.MANAGE_SETTINGS) ||
    (session?.user as any)?.isAdmin === true;

  // Redirect if no permissions
  useEffect(() => {
    if (status === 'authenticated' && !canViewReports && userPermissions.length > 0) {
      toast.error(t('toast.auth.permissionDenied'));
      router.push('/admin');
    }
  }, [canViewReports, userPermissions, status, router, t]);

  useEffect(() => {
    if (canViewReports || status === 'loading') {
      setLoading(false);
    }
  }, [canViewReports, status]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canViewReports) {
    return null; // Will redirect
  }

  const reports = [
    {
      id: 'user-activity',
      title: t("admin.reports.userActivity") || "User Activity Report",
      description: t("admin.reports.userActivityDesc") || "User login patterns, active sessions, and engagement metrics",
      icon: Users,
      category: 'users'
    },
    {
      id: 'document-stats',
      title: t("admin.reports.documentStats") || "Document Statistics",
      description: t("admin.reports.documentStatsDesc") || "Document uploads, downloads, and category breakdown",
      icon: FileText,
      category: 'documents'
    },
    {
      id: 'whatsapp-analytics',
      title: t("admin.reports.whatsappAnalytics") || "WhatsApp Analytics",
      description: t("admin.reports.whatsappAnalyticsDesc") || "Message delivery rates, engagement, and broadcast statistics",
      icon: MessageSquare,
      category: 'communications'
    },
    {
      id: 'system-performance',
      title: t("admin.reports.systemPerformance") || "System Performance",
      description: t("admin.reports.systemPerformanceDesc") || "Application performance metrics and usage trends",
      icon: TrendingUp,
      category: 'system'
    },
    {
      id: 'security-audit',
      title: t("admin.reports.securityAudit") || "Security Audit Log",
      description: t("admin.reports.securityAuditDesc") || "Authentication attempts, permission changes, and security events",
      icon: Eye,
      category: 'security'
    }
  ];

  const generateReport = async (reportId: string) => {
    try {
      toast.info(t('toast.general.loading'));
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(t('toast.general.success'));
    } catch (error) {
      toast.error(t('toast.general.failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("admin.reports") || "Reports"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("admin.reportsDescription") || "Generate analytics and usage reports"}
          </p>
        </div>

        {/* Report Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Report Filters</h2>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateRange({ from: '', to: '' })}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {report.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {report.description}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => generateReport(report.id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate
                  </button>
                  <button
                    onClick={() => setSelectedReport(report.id)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">--</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">--</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Documents Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">--</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Messages Sent</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">--</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}