"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { DocumentCategory, Language } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";

export default function DocumentsPage() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');
  
  const [userLanguage, setUserLanguage] = useState<Language>(Language.FRENCH);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(
    categoryParam as DocumentCategory || null
  );
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Set up mutations
  const incrementViewCount = api.documents.incrementViewCount.useMutation();
  const getDownloadUrl = api.documents.getDownloadUrl.useMutation();

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

  // Fetch documents based on selected category
  const { data: documents, isLoading } = api.documents.getDocumentsByCategory.useQuery({
    category: selectedCategory || DocumentCategory.COMITE_DE_SUIVI,
    language: userLanguage,
    searchQuery: searchQuery
  }, {
    enabled: !!selectedCategory || !categoryParam
  });

  // Format date for display
  const formatDate = (date: Date) => {
    const dateLocale = locale === "fr" ? fr : locale === "ar" ? ar : enUS;
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: dateLocale
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Handle document view
  const handleViewDocument = (documentId: string) => {
    // Increment view count
    incrementViewCount.mutate({ documentId });
    // Navigate to document view page
    window.open(`/owner-dashboard/documents/${documentId}`, '_blank');
  };
  
  // Handle document download
  const handleDownloadDocument = async (documentId: string) => {
    try {
      const result = await getDownloadUrl.mutateAsync({ documentId });
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: DocumentCategory) => {
    setSelectedCategory(category);
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sort documents
  const sortedDocuments = documents ? [...documents].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "viewCount":
        comparison = a.viewCount - b.viewCount;
        break;
      case "downloadCount":
        comparison = a.downloadCount - b.downloadCount;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  }) : [];

  // Get category name
  const getCategoryName = (category: DocumentCategory) => {
    switch (category) {
      case DocumentCategory.COMITE_DE_SUIVI:
        return t("documents.categories.comiteDeSuivi");
      case DocumentCategory.SOCIETE_DE_GESTION:
        return t("documents.categories.societeDeGestion");
      case DocumentCategory.LEGAL:
        return t("documents.categories.legal");
      default:
        return category;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("documents.title")}</h1>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("documents.searchPlaceholder")}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-md ${selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setSelectedCategory(null)}
            >
              {t("documents.allCategories")}
            </button>
            <button
              className={`px-4 py-2 rounded-md ${selectedCategory === DocumentCategory.COMITE_DE_SUIVI ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleCategoryChange(DocumentCategory.COMITE_DE_SUIVI)}
            >
              {t("documents.categories.comiteDeSuivi")}
            </button>
            <button
              className={`px-4 py-2 rounded-md ${selectedCategory === DocumentCategory.SOCIETE_DE_GESTION ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleCategoryChange(DocumentCategory.SOCIETE_DE_GESTION)}
            >
              {t("documents.categories.societeDeGestion")}
            </button>
            <button
              className={`px-4 py-2 rounded-md ${selectedCategory === DocumentCategory.LEGAL ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => handleCategoryChange(DocumentCategory.LEGAL)}
            >
              {t("documents.categories.legal")}
            </button>
          </div>
        </div>
      </div>
      
      {/* Documents list */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50">
          <div className="col-span-5 font-medium text-gray-700">
            <button 
              className="flex items-center" 
              onClick={() => handleSortChange("title")}
            >
              {t("documents.documentName")}
              {sortField === "title" && (
                sortDirection === "asc" ? 
                <ChevronUp className="ml-1 h-4 w-4" /> : 
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </button>
          </div>
          <div className="col-span-2 font-medium text-gray-700">
            <button 
              className="flex items-center" 
              onClick={() => handleSortChange("createdAt")}
            >
              {t("documents.uploadDate")}
              {sortField === "createdAt" && (
                sortDirection === "asc" ? 
                <ChevronUp className="ml-1 h-4 w-4" /> : 
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </button>
          </div>
          <div className="col-span-2 font-medium text-gray-700">
            {t("documents.category")}
          </div>
          <div className="col-span-1 font-medium text-gray-700">
            <button 
              className="flex items-center" 
              onClick={() => handleSortChange("viewCount")}
            >
              {t("documents.views")}
              {sortField === "viewCount" && (
                sortDirection === "asc" ? 
                <ChevronUp className="ml-1 h-4 w-4" /> : 
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </button>
          </div>
          <div className="col-span-2 font-medium text-gray-700 text-right">
            {t("documents.actions")}
          </div>
        </div>
        
        {/* Table body */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="grid grid-cols-12 gap-4">
                  <div className="col-span-5 h-6 bg-gray-200 rounded"></div>
                  <div className="col-span-2 h-6 bg-gray-200 rounded"></div>
                  <div className="col-span-2 h-6 bg-gray-200 rounded"></div>
                  <div className="col-span-1 h-6 bg-gray-200 rounded"></div>
                  <div className="col-span-2 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : sortedDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? t("documents.noSearchResults") : t("documents.noDocuments")}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedDocuments.map((doc) => (
              <div key={doc.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
                <div className="col-span-5">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                      <div className="text-xs text-gray-500 mt-1">{formatFileSize(doc.fileSize)}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-gray-500 self-center">
                  {formatDate(doc.createdAt)}
                </div>
                <div className="col-span-2 self-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getCategoryName(doc.category)}
                  </span>
                </div>
                <div className="col-span-1 text-gray-500 self-center">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{doc.viewCount}</span>
                  </div>
                </div>
                <div className="col-span-2 flex justify-end space-x-2 self-center">
                  <button
                    onClick={() => handleViewDocument(doc.id)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                    title={t("documents.view")}
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(doc.id)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full"
                    title={t("documents.download")}
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 