"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { trpc } from "@/lib/trpc/react";
import { DocumentCategory, Language } from "@/lib/types";
import { FileText, Download, Eye, Filter, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export default function DocumentsPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [userLanguage, setUserLanguage] = useState<Language>(Language.FRENCH);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Get category from URL if present
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      switch (categoryParam) {
        case "comiteDeSuivi":
          setSelectedCategory(DocumentCategory.COMITE_DE_SUIVI);
          break;
        case "societeDeGestion":
          setSelectedCategory(DocumentCategory.SOCIETE_DE_GESTION);
          break;
        case "legal":
          setSelectedCategory(DocumentCategory.LEGAL);
          break;
        default:
          setSelectedCategory(null);
      }
    }
  }, [searchParams]);
  
  // Fetch documents based on selected category
  const { data: documents, isLoading, refetch } = trpc.documents.getDocumentsByCategory.useQuery({
    category: selectedCategory || DocumentCategory.COMITE_DE_SUIVI,
    language: userLanguage,
    limit: 20,
    searchQuery: searchQuery || undefined,
  });
  
  // Refetch when category or search changes
  useEffect(() => {
    refetch();
  }, [selectedCategory, searchQuery, refetch]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(userLanguage === Language.FRENCH ? 'fr-FR' : 'ar-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    trpc.documents.incrementViewCount.mutate({ documentId });
    // Navigate to document view page
    window.open(`/owner-dashboard/documents/${documentId}`, '_blank');
  };
  
  // Handle document download
  const handleDownloadDocument = async (documentId: string) => {
    try {
      const result = await trpc.documents.getDownloadUrl.mutate({ documentId });
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  return (
    <main className="min-h-screen">
      <OwnerDashboardTemplate>
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">{t("documents.title")}</h1>
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory || ""}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setSelectedCategory(null);
                  } else {
                    setSelectedCategory(e.target.value as DocumentCategory);
                  }
                }}
                className="appearance-none pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-48"
              >
                <option value="">{t("documents.allCategories")}</option>
                <option value={DocumentCategory.COMITE_DE_SUIVI}>{t("documents.categories.comiteDeSuivi")}</option>
                <option value={DocumentCategory.SOCIETE_DE_GESTION}>{t("documents.categories.societeDeGestion")}</option>
                <option value={DocumentCategory.LEGAL}>{t("documents.categories.legal")}</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("documents.searchPlaceholder")}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">{t("common.loading")}</div>
          ) : documents && documents.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>{formatDate(doc.createdAt)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{t(`documents.categories.${doc.category}`)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDocument(doc.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{t("documents.view")}</span>
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4" />
                        <span>{t("documents.download")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {searchQuery 
                ? t("documents.noSearchResults", { query: searchQuery }) 
                : t("documents.noDocuments")}
            </div>
          )}
        </div>
      </OwnerDashboardTemplate>
    </main>
  );
} 