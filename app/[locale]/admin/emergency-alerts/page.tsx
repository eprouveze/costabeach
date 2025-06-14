"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { checkPermission } from "@/lib/utils/permissions";
import { Permission } from "@/lib/types";
import { useI18n } from "@/lib/i18n/client";
import EmergencyAlertForm from "@/components/admin/EmergencyAlertForm";

export default function AdminEmergencyAlertsPage() {
  const { t } = useI18n();
  const session = useSession();
  const router = useRouter();
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPermissions = async () => {
      if (session.status === "loading") return;
      try {
        if (!session.data?.user?.id) {
          toast.error(t("auth.loginRequired"));
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
        toast.error(t("admin.errors.permissionsFetchFailed"));
        router.push("/");
      }
    };

    fetchPermissions();
  }, [session, router]);
  
  // Allow access for admins, Comité de Suivi members, or users with document management permissions
  const canSendEmergencyAlerts = 
    userPermissions.includes(Permission.MANAGE_DOCUMENTS) ||
    userPermissions.includes(Permission.MANAGE_COMITE_DOCUMENTS) ||
    (session.data?.user?.isAdmin === true);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("common.loading")}...</p>
        </div>
      </div>
    );
  }

  if (!canSendEmergencyAlerts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("common.accessDenied")}</h1>
          <p className="text-gray-600 mb-4">{t("admin.emergencyAlerts.accessDeniedMessage")}</p>
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("admin.backToDashboard")}
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("admin.backToDashboard")}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("admin.emergencyAlerts.title")}
              </h1>
              <p className="text-gray-600 mt-2">
                {t("admin.emergencyAlerts.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Alert Form */}
        <EmergencyAlertForm />

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">{t("admin.emergencyAlerts.howItWorks.title")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">{t("admin.emergencyAlerts.severityLevels.title")}</h4>
              <ul className="space-y-1">
                <li><strong>{t("admin.emergencyAlerts.severityLevels.low")}:</strong> {t("admin.emergencyAlerts.severityLevels.lowDescription")}</li>
                <li><strong>{t("admin.emergencyAlerts.severityLevels.medium")}:</strong> {t("admin.emergencyAlerts.severityLevels.mediumDescription")}</li>
                <li><strong>{t("admin.emergencyAlerts.severityLevels.high")}:</strong> {t("admin.emergencyAlerts.severityLevels.highDescription")}</li>
                <li><strong>{t("admin.emergencyAlerts.severityLevels.critical")}:</strong> {t("admin.emergencyAlerts.severityLevels.criticalDescription")}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t("admin.emergencyAlerts.deliveryInfo.title")}</h4>
              <ul className="space-y-1">
                <li>• {t("admin.emergencyAlerts.deliveryInfo.instant")}</li>
                <li>• {t("admin.emergencyAlerts.deliveryInfo.branding")}</li>
                <li>• {t("admin.emergencyAlerts.deliveryInfo.tracking")}</li>
                <li>• {t("admin.emergencyAlerts.deliveryInfo.emergencyContacts")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 mb-4">{t("admin.emergencyAlerts.bestPractices.title")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-green-800">
            <div>
              <h4 className="font-medium mb-2">{t("admin.emergencyAlerts.bestPractices.writing.title")}</h4>
              <ul className="space-y-1">
                <li>• {t("admin.emergencyAlerts.bestPractices.writing.clear")}</li>
                <li>• {t("admin.emergencyAlerts.bestPractices.writing.specific")}</li>
                <li>• {t("admin.emergencyAlerts.bestPractices.writing.actionable")}</li>
                <li>• {t("admin.emergencyAlerts.bestPractices.writing.severity")}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t("admin.emergencyAlerts.bestPractices.when.title")}</h4>
              <ul className="space-y-1">
                <li>• {t("admin.emergencyAlerts.bestPractices.when.emergencies")}</li>
                <li>• {t("admin.emergencyAlerts.bestPractices.when.maintenance")}</li>
                <li>• {t("admin.emergencyAlerts.bestPractices.when.weather")}</li>
                <li>• {t("admin.emergencyAlerts.bestPractices.when.security")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}