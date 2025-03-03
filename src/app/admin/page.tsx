"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { Users, FileText, Settings } from "lucide-react";

export default function AdminPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">{t("admin.dashboard")}</h1>
            <div>
              <Link 
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t("common.home")}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        </div>
      </main>
    </div>
  );
} 