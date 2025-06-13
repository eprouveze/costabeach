"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { Users, FileText, Settings, MessageSquare } from "lucide-react";
import { Header } from "@/components/organisms/Header";

export default function AdminPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("admin.dashboard")}</h1>
          <p className="text-gray-600">{t("admin.dashboardDescription")}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link 
            href="/admin/users"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">{t("admin.users")}</h3>
                <p className="text-sm text-gray-500">{t("admin.userManagement")}</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/documents"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">{t("admin.documents")}</h3>
                <p className="text-sm text-gray-500">{t("admin.documentManagement")}</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/owner-registrations"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">{t("admin.pendingRegistrations")}</h3>
                <p className="text-sm text-gray-500">{t("admin.approveRegistration")}</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/settings"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-500 rounded-md p-3">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">{t("admin.settings")}</h3>
                <p className="text-sm text-gray-500">{t("admin.systemSettings")}</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/whatsapp"
            className="bg-white overflow-hidden shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">{t("admin.whatsappManagement")}</h3>
                <p className="text-sm text-gray-500">{t("admin.whatsappDescription")}</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
} 