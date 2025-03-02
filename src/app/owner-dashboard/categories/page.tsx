"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { api } from "@/lib/trpc/react";
import { DocumentCategory, Language } from "@/lib/types";
import { Folder, FileText, ChevronRight, Users, Scale, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";

export default function CategoriesPage() {
  const { t, locale } = useI18n();
  const [userLanguage, setUserLanguage] = useState<Language>(Language.FRENCH);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
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
  
  // Fetch document counts for each category
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
  
  // Define categories with their details
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
  
  // Filter categories based on search query
  const filteredCategories = searchQuery
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;
  
  // Get recent documents for each category
  const getRecentDocuments = (category: DocumentCategory) => {
    switch (category) {
      case DocumentCategory.COMITE_DE_SUIVI:
        return comiteDocuments.data || [];
      case DocumentCategory.SOCIETE_DE_GESTION:
        return societeDocuments.data || [];
      case DocumentCategory.LEGAL:
        return legalDocuments.data || [];
      default:
        return [];
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    const dateLocale = locale === "fr" ? fr : locale === "ar" ? ar : enUS;
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: dateLocale
    });
  };

  return (
    <main className="min-h-screen">
      <OwnerDashboardTemplate>
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">{t("documents.categories.title")}</h1>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("documents.searchCategoriesPlaceholder")}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {/* Categories List */}
        <div className="space-y-6">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 ${category.color} rounded-lg`}>
                        {category.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-medium text-gray-900">{category.name}</h2>
                        <div className="mt-2 text-sm text-gray-500">
                          {category.isLoading ? (
                            <span>{t("common.loading")}</span>
                          ) : (
                            <span>{t("documents.documentCount", { count: category.count })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      href={category.link}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                    >
                      <span>{t("documents.viewAll")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  {/* Recent documents in this category */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">{t("documents.recentDocuments")}</h3>
                    
                    {category.isLoading ? (
                      <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <div className="rounded-lg bg-gray-200 h-10 w-10"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getRecentDocuments(category.id).length > 0 ? (
                          getRecentDocuments(category.id).map((doc) => (
                            <Link 
                              key={doc.id} 
                              href={`/owner-dashboard/documents/${doc.id}`}
                              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                            >
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <FileText className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 text-sm">{doc.title}</h4>
                                <p className="text-xs text-gray-500">{formatDate(doc.createdAt)}</p>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">{t("documents.noDocumentsInCategory")}</p>
                        )}
                      </div>
                    )}
                    
                    {!category.isLoading && getRecentDocuments(category.id).length > 0 && (
                      <Link
                        href={category.link}
                        className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800"
                      >
                        {t("documents.seeAllInCategory", { category: category.name })}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {t("documents.noMatchingCategories")}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {t("documents.tryDifferentSearch")}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t("common.clearSearch")}
                </button>
              )}
            </div>
          )}
        </div>
      </OwnerDashboardTemplate>
    </main>
  );
} 