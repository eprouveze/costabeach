"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ClipboardList, FileText, History, MessageSquare, AlertTriangle, Settings, Shield, Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { toast } from "react-toastify";
import { Header } from "@/components/organisms/Header";
import { api } from "@/lib/trpc/react";

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current locale from pathname
  const locale = pathname?.split('/')[1] || 'fr';
  
  // Fetch dashboard statistics using tRPC
  const { 
    data: dashboardStats, 
    isLoading: statsLoading,
    isError: statsError 
  } = api.admin.getDashboardStats.useQuery(undefined, {
    enabled: session.status === 'authenticated',
    retry: 1,
  });
  
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Wait for session to be determined
        if (session.status === 'loading') {
          return;
        }

        // Check if user is authenticated
        if (session.status === 'unauthenticated' || !session.data?.user?.id) {
          toast.error(t('toast.auth.loginRequired'));
          router.push(`/${locale}/owner-login`);
          return;
        }

        // Fetch user permissions from API
        const response = await fetch(`/api/users/${session.data.user.id}/permissions`);
        if (!response.ok) {
          throw new Error("Failed to fetch user permissions");
        }
        
        const userData = await response.json();
        setUserPermissions(userData.permissions || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error(t('toast.admin.permissionsFetchError'));
        router.push(`/${locale}/`);
      }
    };

    fetchPermissions();
  }, [session.status, session.data?.user?.id, router, locale]);
  
  const canManageDocuments = checkPermission(
    userPermissions,
    Permission.MANAGE_DOCUMENTS
  );
  
  const canManageComiteDocuments = checkPermission(
    userPermissions,
    Permission.MANAGE_COMITE_DOCUMENTS
  );

  const canManageWhatsApp = 
    canManageDocuments || 
    canManageComiteDocuments || 
    (session.data?.user?.isAdmin === true);

  const canManageTranslations = 
    canManageDocuments || 
    canManageComiteDocuments || 
    (session.data?.user?.isAdmin === true);
  
  if (isLoading || session.status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("admin.dashboard")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("admin.dashboardSubtitle") || "Manage your community portal and communication tools"}
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("admin.totalUsers") || "Total Users"}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {statsLoading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-8 h-5 inline-block"></span>
                  ) : statsError ? (
                    "--"
                  ) : (
                    dashboardStats?.totalUsers?.toLocaleString() || "0"
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-2">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("admin.totalDocuments") || "Documents"}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {statsLoading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-8 h-5 inline-block"></span>
                  ) : statsError ? (
                    "--"
                  ) : (
                    dashboardStats?.totalDocuments?.toLocaleString() || "0"
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-2">
                <MessageSquare className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("admin.messagesSent") || "Messages Sent"}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {statsLoading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-8 h-5 inline-block"></span>
                  ) : statsError ? (
                    "--"
                  ) : (
                    dashboardStats?.messagesSent?.toLocaleString() || "0"
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-2">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("admin.activeSessions") || "Active Sessions"}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {statsLoading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-8 h-5 inline-block"></span>
                  ) : statsError ? (
                    "--"
                  ) : (
                    dashboardStats?.activeSessions?.toLocaleString() || "0"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management Card */}
          <Link
            href={`/${locale}/admin/users`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {t("admin.userManagement") || "User Management"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.userManagementDescription") || "Manage user accounts and permissions"}
                </p>
              </div>
            </div>
          </Link>
          
          {/* Document Management Card */}
          {(canManageDocuments || canManageComiteDocuments) && (
            <Link
              href={`/${locale}/admin/documents`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-lg p-3">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {t("admin.documentManagement") || "Document Management"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("admin.documentManagementDescription") || "Upload and organize community documents"}
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Translation Management Card */}
          {canManageTranslations && (
            <Link
              href={`/${locale}/admin/translations`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-lg p-3">
                  <Languages className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {t("admin.translationManagement") || "Translation Management"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("admin.translationManagementDescription") || "Monitor and control document translation system"}
                  </p>
                </div>
              </div>
            </Link>
          )}
          
          {/* WhatsApp Management Card */}
          {canManageWhatsApp && (
            <Link
              href={`/${locale}/admin/whatsapp`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-lg p-3">
                  <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {t("admin.whatsappManagement") || "WhatsApp Management"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("admin.whatsappDescription") || "Send messages and manage WhatsApp communications"}
                  </p>
                </div>
              </div>
            </Link>
          )}
          
          {/* Owner Registrations Card */}
          <Link
            href={`/${locale}/admin/owner-registrations`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {t("admin.ownerRegistrations") || "Owner Registrations"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.ownerRegistrationsDescription") || "Review and approve owner registration requests"}
                </p>
              </div>
            </div>
          </Link>

          {/* Polls Management Card */}
          <Link
            href={`/${locale}/admin/polls`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3">
                <ClipboardList className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {t("admin.pollsManagement") || "Polls Management"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.pollsManagementDescription") || "Create and manage community polls"}
                </p>
              </div>
            </div>
          </Link>
          
          {/* Emergency Alerts Card */}
          <Link
            href={`/${locale}/admin/emergency-alerts`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-lg p-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {t("admin.emergencyAlerts") || "Emergency Alerts"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.emergencyAlertsDescription") || "Send urgent notifications to residents"}
                </p>
              </div>
            </div>
          </Link>
          
          {/* Activity Logs Card */}
          <Link
            href={`/${locale}/admin/logs`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                <History className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {t("admin.activityLogs") || "Activity Logs"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.activityLogsDescription") || "View system activity and audit trails"}
                </p>
              </div>
            </div>
          </Link>
          
          {/* Reports Card */}
          <Link
            href={`/${locale}/admin/reports`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3">
                <ClipboardList className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {t("admin.reports") || "Reports"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.reportsDescription") || "Generate analytics and usage reports"}
                </p>
              </div>
            </div>
          </Link>

          {/* System Settings Card */}
          <Link
            href={`/${locale}/admin/settings`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {t("admin.systemSettings") || "System Settings"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.systemSettingsDescription") || "Configure application settings and preferences"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 