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

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  dateUploaded: string;
  fileSize: string;
}

export function DashboardContent() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');
  const typeParam = searchParams?.get('type');
  const searchQuery = searchParams?.get('search') || "";
  
  const [userLanguage, setUserLanguage] = useState<Language>(Language.FRENCH);
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isManuallyFetching, setIsManuallyFetching] = useState(false);
  
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

  // Determine which category to fetch
  let category: DocumentCategory;
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

  // Get download URL mutation with better error handling
  const getDownloadUrl = api.documents.getDownloadUrl.useMutation({
    onError: (error) => {
      console.error("Error getting download URL:", error);
      toast.error(`${t("documents.errorDownloading") || "Error downloading document"}: ${error.message}`);
    }
  });

  // Fetch documents based on selected category with better caching and stale-while-revalidate
  const { 
    data: documents, 
    isLoading, 
    error, 
    refetch,
    isError
  } = api.documents.getDocumentsByCategory.useQuery(
    {
      category,
      language: userLanguage,
      searchQuery
    }, 
    {
      // Only fetch if not viewing information and not manually fetching
      enabled: (!typeParam || typeParam !== "information") && !isManuallyFetching,
      retry: 2, // Reduce retries to prevent excessive API calls
      retryDelay: attempt => Math.min(1000 * (2 ** attempt), 5000), // Exponential backoff with 5s cap
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on reconnect
    }
  );
  
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

  // Option 1: Change the formatting to include all required fields from the Document interface
  const formattedDocuments = documents?.map(doc => ({
    ...doc, // Keep all original properties
    // Override or add specific properties needed for display
    description: doc.description || "",
    // Don't override fileSize with a string value
    // Keep the numeric fileSize from the original document
    // Add display properties with different names
    displayFileSize: formatFileSize(doc.fileSize),
    displayDate: formatDate(doc.createdAt)
  })) || [];

  // Handle view document
  const handleViewDocument = useCallback((document: any) => {
    try {
      const documentId = document.id;
      window.open(`/${locale}/owner-dashboard/documents/${documentId}`, '_blank');
    } catch (error: any) {
      console.error("Error viewing document:", error);
      toast.error(t("documents.errorViewing") || "Error viewing document");
    }
  }, [locale, t]);
  
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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{t("common.information")}</h2>
        <p className="mb-4">{t("landing.aboutDescription1")}</p>
        <p>{t("landing.aboutDescription2")}</p>
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" data-testid="error-message">
        <p className="font-bold">{t("common.error") || "Error"}</p>
        <p>{error?.message || t("documents.unknownError") || "Unknown error"}</p>
        <button 
          onClick={handleManualRetry}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
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
      <div className="bg-white rounded-lg shadow p-6 text-center" data-testid="empty-state">
        <h2 className="text-xl font-medium mb-2">{t("documents.noDocuments") || "No Documents"}</h2>
        <p className="text-gray-500">{t("documents.noDocumentsInCategory") || "There are no documents in this category."}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {categoryParam 
          ? t(`documents.categories.${categoryParam.toLowerCase()}`) || categoryParam
          : t("documents.title") || "Documents"}
      </h2>
      <DocumentList 
        initialDocuments={formattedDocuments} 
        onView={handleViewDocument}
        onDownload={handleDownloadDocument}
      />
    </div>
  );
} 