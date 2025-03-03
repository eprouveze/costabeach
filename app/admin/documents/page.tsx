"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { api } from "@/lib/trpc/react";
import { 
  DocumentCategory, 
  Language,
  Permission,
  UserPermission,
  type Document
} from "@/lib/types";
import { 
  FileText, 
  Upload, 
  Filter, 
  Search, 
  ChevronDown, 
  History,
  Plus, 
  X, 
  Check, 
  RefreshCw,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentEdit } from "@/components/DocumentEdit";
import { useRTL } from "@/lib/hooks/useRTL";
import { useSession } from "next-auth/react";
import { checkPermission } from "@/lib/utils/permissions";
import { toast } from "react-toastify";

export default function AdminDocumentsPage() {
  const { t } = useI18n();
  const rtl = useRTL();
  const { data: session } = useSession();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "">("");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [canManageAllDocuments, setCanManageAllDocuments] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Get user permissions from session
  useEffect(() => {
    if (session?.user?.id) {
      const getUserPermissions = async () => {
        try {
          // Check if user has MANAGE_DOCUMENTS permission
          const hasManageDocuments = checkPermission(
            session.user.permissions || [],
            UserPermission.MANAGE_DOCUMENTS
          );
          
          setPermissions(session.user.permissions || []);
          setCanManageAllDocuments(hasManageDocuments);
        } catch (error) {
          console.error("Error fetching user permissions:", error);
        }
      };
      
      getUserPermissions();
    }
  }, [session]);

  // Get documents with the current filters
  const { data, refetch, isRefetching } = api.documents.getDocumentsByCategory.useQuery(
    {
      category: selectedCategory as DocumentCategory || undefined,
      language: selectedLanguage as Language || undefined,
      searchQuery,
      limit: 100,
      offset: 0,
    },
    {
      onSuccess: (data) => {
        setDocuments(data);
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(t("documents.errorFetching"));
        console.error("Error fetching documents:", error);
        setIsLoading(false);
      },
    }
  );

  // Filter documents based on permissions
  const filteredDocuments = documents.filter(doc => {
    if (canManageAllDocuments) return true;
    
    const permissionMap = {
      [DocumentCategory.COMITE_REPORTS]: UserPermission.MANAGE_COMITE_DOCUMENTS,
      [DocumentCategory.LEGAL_DOCUMENTS]: UserPermission.MANAGE_LEGAL_DOCUMENTS,
      [DocumentCategory.SOCIETE_DOCUMENTS]: UserPermission.MANAGE_SOCIETE_DOCUMENTS,
      [DocumentCategory.GENERAL]: UserPermission.MANAGE_DOCUMENTS,
    };
    
    return checkPermission(permissions, permissionMap[doc.category] || UserPermission.MANAGE_DOCUMENTS);
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleCategoryChange = (category: DocumentCategory | "") => {
    setSelectedCategory(category);
  };

  const handleLanguageChange = (language: Language | "") => {
    setSelectedLanguage(language);
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedLanguage("");
    setSearchQuery("");
  };

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    refetch();
    toast.success(t("documents.uploadSuccess"));
  };

  const deleteDocumentMutation = api.documents.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success(t("admin.documentDeleted"));
      refetch();
      setShowDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error(t("documents.deleteFailed"));
      console.error("Error deleting document:", error);
    },
  });

  const handleDeleteDocument = (id: string) => {
    deleteDocumentMutation.mutate({ id });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("admin.documentManagement")}
          </h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/documents/logs"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <History className="h-4 w-4 mr-2" />
              {t("admin.documentActivityLogs")}
            </Link>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t("documents.upload")}
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("admin.searchPlaceholder")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t("common.search")}
              </button>
            </form>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filters")}
                <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              {(selectedCategory || selectedLanguage) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("documents.resetFilters")}
                </button>
              )}
              <button
                onClick={() => refetch()}
                className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("documents.category")}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as DocumentCategory | "")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t("documents.allCategories")}</option>
                  {Object.values(DocumentCategory).map((category) => (
                    <option key={category} value={category}>
                      {t(`documents.categories.${category}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("documents.language")}
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as Language | "")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t("documents.allLanguages")}</option>
                  <option value={Language.FR}>{t("common.languages.french")}</option>
                  <option value={Language.AR}>{t("common.languages.arabic")}</option>
                  <option value={Language.EN}>{t("common.languages.english")}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Document grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mr-2" />
            <span>{t("common.loading")}</span>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.map((doc) => (
                <li key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="ml-3">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{doc.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                            {t(`documents.categories.${doc.category}`)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            {t(`common.languages.${doc.language.toLowerCase()}`)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                            {t("documents.views")}: {doc.viewCount || 0}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                            {t("documents.downloads")}: {doc.downloadCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center mt-4 md:mt-0 space-x-2">
                    <button
                      onClick={() => window.open(`/documents/${doc.id}`, '_blank')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("common.view")}
                    </button>
                    <button
                      onClick={() => setDocumentToEdit(doc)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {t("common.edit")}
                    </button>
                    <Link
                      href={`/admin/documents/logs?documentId=${doc.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <History className="h-4 w-4 mr-2" />
                      {t("common.history")}
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(doc.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm text-white bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("common.delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("documents.noDocuments")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
              {t("documents.noDocumentsDescription")}
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("documents.uploadFirst")}
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t("admin.confirmDelete")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t("documents.deleteWarning")}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => handleDeleteDocument(showDeleteConfirm)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsUploadModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("documents.uploadNew")}
                </h2>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <DocumentUpload onSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {documentToEdit && (
        <DocumentEdit
          document={documentToEdit}
          onClose={() => setDocumentToEdit(null)}
          onSave={() => {
            setDocumentToEdit(null);
            refetch();
          }}
        />
      )}
    </div>
  );
} 