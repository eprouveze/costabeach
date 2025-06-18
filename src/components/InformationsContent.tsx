"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { Language } from "@/lib/types";
import { Calendar, User, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";

export function InformationsContent() {
  const { t, locale } = useI18n();
  
  // Derive language from locale
  const currentLanguage: Language =
    locale === "fr" ? Language.FRENCH :
    locale === "ar" ? Language.ARABIC :
    Language.ENGLISH;

  // Fetch published information posts
  const { data: posts = [], isLoading } = api.information.getPublishedPosts.useQuery({
    language: currentLanguage,
    limit: 20
  });

  // Format date for display
  const formatDate = (date: Date) => {
    const dateLocale = locale === "fr" ? fr : locale === "ar" ? ar : enUS;
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: dateLocale
    });
  };

  // Get content in current language or fallback to original
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t("common.information")}
      </h1>
      
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("information.noPosts") || "No information available"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t("information.noPostsDescription") || "Check back later for updates and announcements."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const localizedContent = getLocalizedContent(post);
            return (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
              >
                <header className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {localizedContent.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{post.creator?.name || t("common.unknown") || "Unknown"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                  </div>
                </header>
                
                {localizedContent.excerpt && (
                  <div className="mb-4 text-gray-600 dark:text-gray-300 font-medium">
                    {localizedContent.excerpt}
                  </div>
                )}
                
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {localizedContent.content}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}