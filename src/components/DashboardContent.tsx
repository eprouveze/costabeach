"use client";

import { useEffect, useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSearchParams } from "next/navigation";
import { DocumentList } from "./organisms/DocumentList";
import { api } from "@/lib/trpc";
import { DocumentCategory, Language } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";
import { toast } from "react-toastify";
import { Grid3X3, List, LayoutGrid } from "lucide-react";
import { DocumentPreview } from "./organisms/DocumentPreview";

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  dateUploaded: string;
  fileSize: string;
}

type ViewMode = 'tiles' | 'list';

export function DashboardContent() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');
  const typeParam = searchParams?.get('type');
  const searchQuery = searchParams?.get('search') || "";
  
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isManuallyFetching, setIsManuallyFetching] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('tiles');

  // Load saved view mode from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('documents-view-mode') as ViewMode;
    if (savedViewMode && (savedViewMode === 'tiles' || savedViewMode === 'list')) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage when it changes
  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem('documents-view-mode', newViewMode);
  }, []);
  
  // Derive language directly from locale to avoid stale queries
  const derivedLanguage: Language =
    locale === "fr" ? Language.FRENCH :
    locale === "ar" ? Language.ARABIC :
    Language.ENGLISH;

  // Determine whether to fetch all documents or specific category
  const isAllDocuments = categoryParam === "ALL" || !categoryParam;
  
  // Determine which category to fetch (only when not fetching all)
  let category: DocumentCategory | undefined;
  if (!isAllDocuments) {
    switch (categoryParam) {
      case "GENERAL":
        category = DocumentCategory.GENERAL;
        break;
      case "COMITE_DE_SUIVI":
        category = DocumentCategory.COMITE_DE_SUIVI;
        break;
      case "SOCIETE_DE_GESTION":
        category = DocumentCategory.SOCIETE_DE_GESTION;
        break;
      case "FINANCE":
        category = DocumentCategory.FINANCE;
        break;
      case "LEGAL":
        category = DocumentCategory.LEGAL;
        break;
      default:
        category = DocumentCategory.COMITE_DE_SUIVI;
    }
  }

  // Log for debugging purposes
  console.log(`Fetching documents: ${isAllDocuments ? 'ALL' : category} for param: ${categoryParam}`);

  // Get download URL mutation with better error handling
  const getDownloadUrl = api.documents.getDownloadUrl.useMutation({
    onError: (error) => {
      console.error("Error getting download URL:", error);
      toast.error(`${t("documents.errorDownloading") || "Error downloading document"}: ${error.message}`);
    }
  });

  // Fetch all documents when category is ALL
  const { 
    data: allDocuments, 
    isLoading: isLoadingAll, 
    error: errorAll, 
    refetch: refetchAll,
    isError: isErrorAll
  } = api.documents.getAllDocuments.useQuery(
    {
      limit: 50 // Get more documents when showing all
    }, 
    {
      enabled: isAllDocuments && (!typeParam || typeParam !== "information") && !isManuallyFetching,
      retry: 2,
      retryDelay: attempt => Math.min(1000 * (2 ** attempt), 5000),
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    }
  );

  // Fetch documents by category when specific category is selected
  const { 
    data: categoryDocuments, 
    isLoading: isLoadingCategory, 
    error: errorCategory, 
    refetch: refetchCategory,
    isError: isErrorCategory
  } = api.documents.getDocumentsByCategory.useQuery(
    {
      category: category!,
      language: derivedLanguage,
      searchQuery
    }, 
    {
      enabled: !isAllDocuments && (!typeParam || typeParam !== "information") && !isManuallyFetching,
      retry: 2,
      retryDelay: attempt => Math.min(1000 * (2 ** attempt), 5000),
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    }
  );

  // Combine the results based on which query is active
  const documents = isAllDocuments ? allDocuments : categoryDocuments;
  const isLoading = isAllDocuments ? isLoadingAll : isLoadingCategory;
  const error = isAllDocuments ? errorAll : errorCategory;
  const refetch = isAllDocuments ? refetchAll : refetchCategory;
  const isError = isAllDocuments ? isErrorAll : isErrorCategory;
  
  // Handle errors separately with an effect
  useEffect(() => {
    if (error) {
      console.error("Error fetching documents:", error);
      toast.error(`${t("documents.errorLoading") || "Error loading documents"}: ${error.message}`);
    }
  }, [error, t]);

  // Handle manual retry with debounce
  const [isRetryDisabled, setIsRetryDisabled] = useState(false);
  
  const handleManualRetry = useCallback(async () => {
    if (isRetryDisabled) return;
    
    try {
      setIsRetryDisabled(true);
      setIsManuallyFetching(true);
      toast.info(t("common.retrying") || "Retrying...");
      await refetch();
      toast.success(t("common.retrySuccessful") || "Successfully refreshed");
    } catch (err: any) {
      toast.error(`${t("common.retryFailed") || "Retry failed"}: ${err.message}`);
    } finally {
      setIsManuallyFetching(false);
      // Disable retry button for 2 seconds to prevent spam clicks
      setTimeout(() => setIsRetryDisabled(false), 2000);
    }
  }, [refetch, t, isRetryDisabled]);

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

  // Format documents for display (API now handles grouping)
  const formattedDocuments = documents ? documents.map(doc => ({
    ...doc,
    description: doc.description || "",
    displayFileSize: formatFileSize(doc.fileSize),
    displayDate: formatDate(doc.createdAt)
  })) : [];

  // Handle view document
  const handleViewDocument = useCallback((document: any) => {
    try {
      setViewingDocumentId(document.id);
    } catch (error: any) {
      console.error("Error viewing document:", error);
      toast.error(t("documents.errorViewing") || "Error viewing document");
    }
  }, [t]);

  // Handle close document preview
  const handleClosePreview = useCallback(() => {
    setViewingDocumentId(null);
  }, []);

  // Find the document being viewed
  const viewingDocument = viewingDocumentId 
    ? formattedDocuments.find(doc => doc.id === viewingDocumentId)
    : null;
  
  // Handle download document
  const handleDownloadDocument = useCallback(async (document: any) => {
    const documentId = document.id;
    try {
      const result = await getDownloadUrl.mutateAsync({ documentId });
      if (result && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      } else {
        throw new Error(t("documents.noDownloadUrl") || "No download URL available");
      }
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast.error(`${t("documents.errorDownloading") || "Error downloading document"}: ${error.message || t("common.unknownError") || "Unknown error"}`);
    }
  }, [getDownloadUrl, t]);

  // If information section is active
  if (typeParam === "information") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("common.information")}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{t("landing.aboutDescription1")}</p>
        <p className="text-gray-700 dark:text-gray-300">{t("landing.aboutDescription2")}</p>
      </div>
    );
  }

  // If loading
  if (isLoading || isManuallyFetching) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" role="status"></div>
      </div>
    );
  }

  // If error
  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded" data-testid="error-message">
        <p className="font-bold">{t("common.error") || "Error"}</p>
        <p>{error?.message || t("documents.unknownError") || "Unknown error"}</p>
        <button 
          onClick={handleManualRetry}
          className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 rounded transition-colors"
          disabled={isManuallyFetching}
        >
          {isManuallyFetching 
            ? t("common.retrying") || "Retrying..." 
            : t("common.retry") || "Retry"}
        </button>
      </div>
    );
  }

  // If no documents
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 text-center" data-testid="empty-state">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t("documents.noDocuments") || "No Documents"}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t("documents.noDocumentsInCategory") || "There are no documents in this category."}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {categoryParam 
            ? t(`documents.categories.${categoryParam.toLowerCase()}`) || categoryParam
            : t("documents.title") || "Documents"}
        </h2>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('tiles')}
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
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
            }`}
            title={t("documents.listView") || "List View"}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <DocumentList 
        initialDocuments={formattedDocuments} 
        viewMode={viewMode}
        onView={handleViewDocument}
        onDownload={handleDownloadDocument}
      />
      
      {/* Document Preview Modal */}
      {viewingDocument && (
        <DocumentPreview
          document={viewingDocument}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
} 