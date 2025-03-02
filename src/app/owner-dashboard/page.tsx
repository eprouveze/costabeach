"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { api } from "@/lib/trpc/react";
import { DocumentCategory, Language } from "@/lib/types";
import { FileText, Bell, ChevronRight, Users, Folder, Scale } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";

export default function OwnerDashboardPage() {
  const { t, locale } = useI18n();
  const [userLanguage, setUserLanguage] = useState<Language>(Language.FRENCH);
  
  // Set user language based on locale
  useEffect(() => {
    if (locale === "fr") {
      setUserLanguage(Language.FRENCH);
    } else if (locale === "ar") {
      setUserLanguage(Language.ARABIC);
    } else {
      setUserLanguage(Language.ENGLISH);
    }
  }, [locale]);
  
  // Fetch documents for each category
  const comiteDocuments = api.documents.getDocumentsByCategory.useQuery({
    category: DocumentCategory.COMITE_DE_SUIVI,
    language: userLanguage,
    limit: 3
  });
  
  const societeDocuments = api.documents.getDocumentsByCategory.useQuery({
    category: DocumentCategory.SOCIETE_DE_GESTION,
    language: userLanguage,
    limit: 3
  });
  
  const legalDocuments = api.documents.getDocumentsByCategory.useQuery({
    category: DocumentCategory.LEGAL,
    language: userLanguage,
    limit: 3
  });
  
  // Format date for display
  const formatDate = (date: Date) => {
    const dateLocale = locale === "fr" ? fr : locale === "ar" ? ar : enUS;
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: dateLocale
    });
  };
  
  // Mock notifications - would be fetched from API in a real implementation
  const notifications = [
    {
      id: 1,
      title: t("notifications.newDocument"),
      message: t("notifications.newDocumentMessage"),
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false
    },
    {
      id: 2,
      title: t("notifications.documentUpdated"),
      message: t("notifications.documentUpdatedMessage"),
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true
    },
    {
      id: 3,
      title: t("notifications.maintenanceScheduled"),
      message: t("notifications.maintenanceScheduledMessage"),
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      read: true
    }
  ];
  
  // Document categories
  const categories = [
    {
      id: DocumentCategory.COMITE_DE_SUIVI,
      name: t("documents.categories.comiteDeSuivi"),
      icon: <Users className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-100",
      link: "/owner-dashboard/documents?category=COMITE_DE_SUIVI",
      count: comiteDocuments.data?.length || 0,
      isLoading: comiteDocuments.isLoading
    },
    {
      id: DocumentCategory.SOCIETE_DE_GESTION,
      name: t("documents.categories.societeDeGestion"),
      icon: <Folder className="h-8 w-8 text-green-500" />,
      color: "bg-green-100",
      link: "/owner-dashboard/documents?category=SOCIETE_DE_GESTION",
      count: societeDocuments.data?.length || 0,
      isLoading: societeDocuments.isLoading
    },
    {
      id: DocumentCategory.LEGAL,
      name: t("documents.categories.legal"),
      icon: <Scale className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-100",
      link: "/owner-dashboard/documents?category=LEGAL",
      count: legalDocuments.data?.length || 0,
      isLoading: legalDocuments.isLoading
    }
  ];
  
  // Get recent documents from all categories
  const getRecentDocuments = () => {
    const allDocuments = [
      ...(comiteDocuments.data || []),
      ...(societeDocuments.data || []),
      ...(legalDocuments.data || [])
    ];
    
    // Sort by creation date (newest first) and take the first 5
    return allDocuments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };
  
  const isLoading = comiteDocuments.isLoading || societeDocuments.isLoading || legalDocuments.isLoading;
  const recentDocuments = getRecentDocuments();

  return (
    <main className="min-h-screen">
      <OwnerDashboardTemplate>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{t("dashboard.welcome")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("dashboard.overview")}</p>
        </div>
        
        {/* Document Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">{t("dashboard.documentCategories")}</h2>
            <Link 
              href="/owner-dashboard/categories"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {t("documents.viewAll")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={category.link}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${category.color} mr-4`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {category.isLoading 
                        ? t("common.loading") 
                        : t("documents.documentCount", { count: category.count })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Recent Documents */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">{t("dashboard.recentDocuments")}</h2>
            <Link 
              href="/owner-dashboard/documents"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {t("dashboard.viewAllDocuments")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="animate-pulse p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="rounded-lg bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentDocuments.map((doc) => (
                  <Link 
                    key={doc.id} 
                    href={`/owner-dashboard/documents/${doc.id}`}
                    className="flex items-center p-4 hover:bg-gray-50"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg mr-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{doc.title}</h3>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <span>{formatDate(doc.createdAt)}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{t(`documents.categories.${doc.category}`)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                {t("documents.noDocuments")}
              </div>
            )}
          </div>
        </div>
        
        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">{t("dashboard.notifications")}</h2>
            <Link 
              href="/owner-dashboard/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {t("dashboard.viewAllNotifications")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.slice(0, 3).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className="p-2 bg-gray-100 rounded-full mr-4">
                        <Bell className={`w-5 h-5 ${!notification.read ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${!notification.read ? 'text-blue-800' : 'text-gray-800'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(notification.date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                {t("dashboard.noNotifications")}
              </div>
            )}
          </div>
        </div>
      </OwnerDashboardTemplate>
    </main>
  );
} 