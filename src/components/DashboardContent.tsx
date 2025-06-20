"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { Language } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";
import { FileText, Calendar, User, ExternalLink, ArrowRight, Download } from "lucide-react";
import Link from "next/link";

export function DashboardContent() {
  const { t, locale } = useI18n();
  
  // Derive language from locale
  const currentLanguage: Language =
    locale === "fr" ? Language.FRENCH :
    locale === "ar" ? Language.ARABIC :
    Language.ENGLISH;

  // Fetch latest published information posts (3 most recent)
  const { data: latestInfo = [], isLoading: isLoadingInfo } = api.information.getPublishedPosts.useQuery({
    language: currentLanguage,
    limit: 3
  });

  // Fetch latest documents (3 most recent)
  const { data: latestDocs = [], isLoading: isLoadingDocs } = api.documents.getAllDocuments.useQuery({
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

  // Get localized content for information posts
  const getLocalizedContent = (post: any) => {
    const translation = post.translations?.find((t: any) => t.language === currentLanguage);
    if (translation) {
      return {
        title: translation.title,
        content: translation.content,
        excerpt: translation.excerpt
      };
    }
    return {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt
    };
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-4 sm:p-6 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {t("admin.dashboard") || "Dashboard"}
        </h1>
        <p className="text-blue-100">
          {t("admin.dashboardSubtitle") || "Manage your community portal and communication tools"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Latest Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t("common.information") || "Information"}
              </h2>
            </div>
            <Link 
              href={`/${locale}/owner-dashboard/informations`}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm font-medium"
            >
              {t("common.seeAll") || "See all"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="p-4 sm:p-6">
            {isLoadingInfo ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : latestInfo.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>{t("information.noPosts") || "No information available"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {latestInfo.map((post) => {
                  const localizedContent = getLocalizedContent(post);
                  return (
                    <div key={post.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {localizedContent.title}
                      </h3>
                      {localizedContent.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                          {localizedContent.excerpt}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <User className="h-3 w-3 mr-1" />
                        <span className="mr-3">{post.creator?.name || t("common.unknown")}</span>
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Latest Documents Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t("common.documents") || "Documents"}
              </h2>
            </div>
            <Link 
              href={`/${locale}/owner-dashboard/documents`}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center text-sm font-medium"
            >
              {t("common.seeAll") || "See all"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="p-4 sm:p-6">
            {isLoadingDocs ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : latestDocs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>{t("documents.noDocuments") || "No documents available"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {latestDocs.map((doc) => (
                  <div key={doc.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-1">
                            {doc.description}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                            {doc.fileType}
                          </span>
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>
                      </div>
                      <Link
                        href={`/${locale}/owner-dashboard/documents/${doc.id}`}
                        className="ml-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title={t("documents.view") || "View document"}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t("navigation.quickLinks") || "Quick Links"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href={`/${locale}/owner-dashboard/documents`}
            className="flex flex-col sm:flex-row items-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center sm:text-left"
          >
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2 sm:mb-0 sm:mr-3" />
            <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {t("common.documents")}
            </span>
          </Link>
          
          <Link
            href={`/${locale}/owner-dashboard/informations`}
            className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <FileText className="h-8 w-8 text-green-600 mr-3" />
            <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {t("common.information")}
            </span>
          </Link>
          
          <Link
            href={`/${locale}/polls`}
            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <FileText className="h-8 w-8 text-purple-600 mr-3" />
            <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {t("navigation.polls")}
            </span>
          </Link>
          
          <Link
            href={`/${locale}/contact`}
            className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <FileText className="h-8 w-8 text-orange-600 mr-3" />
            <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
              {t("navigation.contact")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}