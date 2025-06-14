"use client";

import React, { useState } from "react";
import { api } from "@/lib/trpc/react";
import { useI18n } from "@/lib/i18n/client";
import { DocumentCategory, Language } from "@/lib/types";
import { DocumentCard } from "@/components/DocumentCard";
import { 
  FileText, 
  Upload, 
  Filter, 
  Search,
  Users,
  Eye,
  Download
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminDocumentsPage() {
  const { t, locale } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "all">("all");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Derive language from locale
  const derivedLanguage: Language =
    locale === "fr" ? Language.FRENCH :
    locale === "ar" ? Language.ARABIC :
    Language.ENGLISH;

  // Fetch documents for admin view
  const { 
    data: documents = [], 
    isLoading,
    refetch 
  } = api.documents.getAllDocuments.useQuery({
    includePrivate: true // Admin can see all documents
  });

  const deleteDocument = api.documents.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Document deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    }
  });

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      deleteDocument.mutate({ documentId });
    }
  };

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    const matchesLanguage = selectedLanguage === "all" || doc.language === selectedLanguage;
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesLanguage && matchesSearch;
  });

  const getCategoryLabel = (category: DocumentCategory) => {
    switch (category) {
      case DocumentCategory.COMITE_DE_SUIVI:
        return t("documents.categories.comiteDeSuivi");
      case DocumentCategory.SOCIETE_DE_GESTION:
        return t("documents.categories.societeDeGestion");
      case DocumentCategory.LEGAL:
        return t("documents.categories.legal");
      case DocumentCategory.FINANCE:
        return t("documents.categories.finance");
      case DocumentCategory.GENERAL:
        return t("documents.categories.general");
      default:
        return category;
    }
  };

  const getLanguageLabel = (language: Language) => {
    switch (language) {
      case Language.FRENCH:
        return t("languages.french");
      case Language.ARABIC:
        return t("languages.arabic");
      case Language.ENGLISH:
        return t("languages.english");
      default:
        return language;
    }
  };

  const totalViews = documents.reduce((sum, doc) => sum + (doc.viewCount || 0), 0);
  const totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0);
  const publishedDocuments = documents.filter(doc => doc.isPublished).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("admin.documents.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t("admin.documents.description")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("admin.documents.totalDocuments")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("admin.documents.published")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {publishedDocuments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("admin.documents.totalViews")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("admin.documents.totalDownloads")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalDownloads.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | "all")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t("documents.allCategories")}</option>
                {Object.values(DocumentCategory).map((category) => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language | "all")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{t("documents.allLanguages")}</option>
                {Object.values(Language).map((language) => (
                  <option key={language} value={language}>
                    {getLanguageLabel(language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center"
            >
              <Upload className="h-5 w-5 mr-2" />
              {t("documents.upload")}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            {t("documents.showingResults", { 
              count: filteredDocuments.length, 
              total: documents.length 
            })}
          </p>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={{
                  ...document,
                  category: document.category as DocumentCategory,
                  language: document.language as Language
                }}
                onDelete={handleDeleteDocument}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("documents.noDocuments")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || selectedCategory !== "all" || selectedLanguage !== "all"
                ? t("documents.noMatchingDocuments")
                : t("documents.noDocumentsDescription")
              }
            </p>
            {(!searchQuery && selectedCategory === "all" && selectedLanguage === "all") && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                <Upload className="h-5 w-5 mr-2" />
                {t("documents.uploadFirst")}
              </button>
            )}
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t("documents.uploadDocument")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t("documents.uploadComingSoon")}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}