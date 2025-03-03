"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ClipboardList, FileText, History } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { toast } from "react-toastify";

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const session = useSession();
  const router = useRouter();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Check if user is authenticated
        if (!session.data?.user?.id) {
          toast.error("You must be logged in to access this page");
          router.push("/login");
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
        toast.error("Failed to fetch permissions");
        router.push("/");
      }
    };

    fetchPermissions();
  }, [session, router]);
  
  const canManageDocuments = checkPermission(
    userPermissions,
    Permission.MANAGE_DOCUMENTS
  );
  
  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t("admin.dashboard")}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management Card */}
          <Link
            href="/admin/users"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t("admin.userManagement")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.userManagementDescription")}
                </p>
              </div>
            </div>
          </Link>
          
          {/* Document Management Card */}
          {canManageDocuments && (
            <Link
              href="/admin/documents"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t("admin.documentManagement")}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("admin.documentManagementDescription")}
                  </p>
                </div>
              </div>
            </Link>
          )}
          
          {/* Activity Logs Card */}
          <Link
            href="/admin/logs"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
                <History className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t("admin.activityLogs")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.activityLogsDescription")}
                </p>
              </div>
            </div>
          </Link>
          
          {/* Reports Card */}
          <Link
            href="/admin/reports"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-3">
                <ClipboardList className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t("admin.reports")}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.reportsDescription")}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 