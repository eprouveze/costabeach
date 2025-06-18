"use client";

import React, { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { Language } from "@/lib/types";
import { Calendar, User, FileText, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";

export function InformationsContent() {
  const { t, locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter((post) => {
      const localizedContent = getLocalizedContent(post);
      return (
        localizedContent.title.toLowerCase().includes(query) ||
        localizedContent.content.toLowerCase().includes(query) ||
        (localizedContent.excerpt && localizedContent.excerpt.toLowerCase().includes(query)) ||
        (post.creator?.name && post.creator.name.toLowerCase().includes(query))
      );
    });
  }, [posts, searchQuery, currentLanguage]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          {t("common.information")}
        </h1>
        
        {/* Search Bar */}
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder={t("documents.searchPlaceholder") || "Search information..."}
          />
        </div>
      </div>
      
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
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("common.noResults") || "No results found"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search terms to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => {
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