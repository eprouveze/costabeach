"use client";

import React, { useState, useEffect } from "react";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { trpc } from "@/lib/trpc/react";
import { DocumentCategory, Language } from "@/lib/types";
import { FileText, Clock, Bell } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";

export default function OwnerDashboardPage() {
  const { t } = useI18n();
  const [userLanguage, setUserLanguage] = useState<Language>(Language.FRENCH);
  
  // Fetch recent documents from each category
  const comiteDocuments = trpc.documents.getDocumentsByCategory.useQuery({
    category: DocumentCategory.COMITE_DE_SUIVI,
    language: userLanguage,
    limit: 3,
  });
  
  const societeDocuments = trpc.documents.getDocumentsByCategory.useQuery({
    category: DocumentCategory.SOCIETE_DE_GESTION,
    language: userLanguage,
    limit: 3,
  });
  
  const legalDocuments = trpc.documents.getDocumentsByCategory.useQuery({
    category: DocumentCategory.LEGAL,
    language: userLanguage,
    limit: 3,
  });

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(userLanguage === Language.FRENCH ? 'fr-FR' : 'ar-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Document category cards
  const categories = [
    { 
      name: t("documents.categories.comiteDeSuivi"), 
      icon: FileText, 
      color: "bg-blue-100 text-blue-600",
      href: "/owner-dashboard/documents?category=comiteDeSuivi",
      count: comiteDocuments.data?.length || 0
    },
    { 
      name: t("documents.categories.societeDeGestion"), 
      icon: FileText, 
      color: "bg-green-100 text-green-600",
      href: "/owner-dashboard/documents?category=societeDeGestion",
      count: societeDocuments.data?.length || 0
    },
    { 
      name: t("documents.categories.legal"), 
      icon: FileText, 
      color: "bg-purple-100 text-purple-600",
      href: "/owner-dashboard/documents?category=legal",
      count: legalDocuments.data?.length || 0
    }
  ];

  return (
    <main className="min-h-screen">
      <OwnerDashboardTemplate>
        {/* Document Categories */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("dashboard.documentCategories")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link 
                  key={index} 
                  href={category.href}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${category.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">
                      {category.count} {t("dashboard.documents")}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Documents */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{t("dashboard.recentDocuments")}</h2>
            <Link href="/owner-dashboard/documents" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {t("dashboard.viewAll")}
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {comiteDocuments.isLoading || societeDocuments.isLoading || legalDocuments.isLoading ? (
              <div className="p-6 text-center text-gray-500">{t("common.loading")}</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {[...(comiteDocuments.data || []), ...(societeDocuments.data || []), ...(legalDocuments.data || [])]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((doc) => (
                    <div key={doc.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{doc.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatDate(doc.createdAt)}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{t(`documents.categories.${doc.category}`)}</span>
                          </div>
                        </div>
                        <Link 
                          href={`/owner-dashboard/documents/${doc.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {t("dashboard.view")}
                        </Link>
                      </div>
                    </div>
                  ))}
                
                {[...(comiteDocuments.data || []), ...(societeDocuments.data || []), ...(legalDocuments.data || [])].length === 0 && (
                  <div className="p-6 text-center text-gray-500">{t("dashboard.noDocuments")}</div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{t("dashboard.notifications")}</h2>
            <Link href="/owner-dashboard/notifications" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {t("dashboard.viewAll")}
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-center p-6 text-gray-500">
              <Bell className="w-5 h-5 mr-2" />
              <span>{t("dashboard.noNotifications")}</span>
            </div>
          </div>
        </section>
      </OwnerDashboardTemplate>
    </main>
  );
} 