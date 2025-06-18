"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { DocumentCategory, Document } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { DocumentCard } from "@/components/DocumentCard";
import { 
  FileText, 
  Search, 
  X
} from "lucide-react";

export function DocumentsContent() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(
    categoryParam as DocumentCategory || null
  );

  // Fetch all documents with translations
  const { data: documents = [], isLoading, refetch } = api.documents.getAllDocuments.useQuery({
    includePrivate: false // Owner dashboard shows only public documents
  });

  
  // Handle document view
  const handleViewDocument = (document: Document) => {
    // Navigate to document view page
    window.location.href = `/${locale}/owner-dashboard/documents/${document.id}`;
  };

  // Handle category change
  const handleCategoryChange = (category: DocumentCategory) => {
    setSelectedCategory(category);
  };

  // Filter documents based on search and selected category
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === null || doc.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

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
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-4">
                <div className="col-span-5 h-6 bg-gray-200 rounded"></div>
                <div className="col-span-2 h-6 bg-gray-200 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("documents.noDocuments")}
          </h3>
          <p className="text-gray-500">
            {searchQuery || selectedCategory !== null
              ? t("documents.noMatchingDocuments")
              : t("documents.noDocumentsDescription")
            }
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-5">{t("documents.name")}</div>
              <div className="col-span-2">{t("documents.category")}</div>
              <div className="col-span-1 text-center">{t("documents.original")}</div>
              <div className="col-span-1 text-center">{t("documents.translations")}</div>
              <div className="col-span-1">{t("documents.size")}</div>
              <div className="col-span-1">{t("documents.views")}</div>
              <div className="col-span-1 text-right">{t("documents.actions")}</div>
            </div>
          </div>
          {/* Document rows */}
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={handleViewDocument}
              showActions={true}
              viewMode="table"
            />
          ))}
        </div>
      )}
    </div>
  );
}