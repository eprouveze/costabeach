"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { Users, FileText, MessageSquare, Shield } from "lucide-react";

export function AdminDashboardContent() {
  const { t } = useI18n();
  
  // Fetch dashboard statistics using tRPC
  const { 
    data: dashboardStats, 
    isLoading: statsLoading,
    isError: statsError 
  } = api.admin.getDashboardStats.useQuery(undefined, {
    retry: 1,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {t("admin.dashboard") || "Admin Dashboard"}
        </h1>
        <p className="text-blue-100">
          {t("admin.dashboardSubtitle") || "Manage your community portal and communication tools"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("admin.totalUsers") || "Total Users"}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {statsLoading ? (
                  <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-12 h-7 inline-block"></span>
                ) : statsError ? (
                  "--"
                ) : (
                  dashboardStats?.totalUsers?.toLocaleString() || "0"
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("admin.totalDocuments") || "Documents"}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {statsLoading ? (
                  <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-12 h-7 inline-block"></span>
                ) : statsError ? (
                  "--"
                ) : (
                  dashboardStats?.totalDocuments?.toLocaleString() || "0"
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-3">
              <MessageSquare className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("admin.messagesSent") || "Messages Sent"}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {statsLoading ? (
                  <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-12 h-7 inline-block"></span>
                ) : statsError ? (
                  "--"
                ) : (
                  dashboardStats?.messagesSent?.toLocaleString() || "0"
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("admin.activeSessions") || "Active Sessions"}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {statsLoading ? (
                  <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-12 h-7 inline-block"></span>
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

      {/* Quick Access Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t("admin.quickActions") || "Quick Actions"}
        </h2>
        <div className="text-gray-600 dark:text-gray-300 space-y-2">
          <p>• Use the left navigation to access different admin sections</p>
          <p>• Manage users, documents, information posts, and communications</p>
          <p>• Monitor system activity through logs and reports</p>
          <p>• Configure system settings and emergency alerts</p>
        </div>
      </div>
    </div>
  );
}