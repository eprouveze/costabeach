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
  X,
  ChevronDown,
  LayoutGrid,
  List
} from "lucide-react";

type ViewMode = 'tiles' | 'list' | 'table';

export function DocumentsContent() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(
    categoryParam as DocumentCategory || null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

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
  const handleCategoryChange = (category: DocumentCategory | null) => {
    setSelectedCategory(category);
    setDropdownOpen(false);
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
      case DocumentCategory.GENERAL:
        return t("documents.categories.general");
      case DocumentCategory.FINANCE:
        return t("documents.categories.finance");
      default:
        return category;
    }
  };

  // All categories for dropdown
  const allCategories = [
    DocumentCategory.COMITE_DE_SUIVI,
    DocumentCategory.SOCIETE_DE_GESTION,
    DocumentCategory.LEGAL,
    DocumentCategory.GENERAL,
    DocumentCategory.FINANCE
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("documents.title")}</h1>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('tiles')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'tiles'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
            }`}
            title={t("documents.tilesView") || "Tiles View"}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
            }`}
            title={t("documents.listView") || "List View"}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
            }`}
            title={t("documents.tableView") || "Table View"}
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("documents.searchPlaceholder")}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}
          </div>
          
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between w-full md:w-auto px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="mr-2">
                {selectedCategory ? getCategoryName(selectedCategory) : t("documents.allCategories")}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedCategory === null ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t("documents.allCategories")}
                  </button>
                  {allCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedCategory === category ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {getCategoryName(category)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Documents list */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-4">
                <div className="col-span-5 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="col-span-2 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="col-span-1 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("documents.noDocuments")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || selectedCategory !== null
              ? t("documents.noMatchingDocuments")
              : t("documents.noDocumentsDescription")
            }
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
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