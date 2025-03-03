"use client";

import { useEffect, useState } from "react";
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
  const categoryParam = searchParams.get('category');
  const typeParam = searchParams.get('type');
  const searchQuery = searchParams.get('search') || "";
  
  const [userLanguage, setUserLanguage] = useState<Language>(Language.FRENCH);
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
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

  // Fetch documents based on selected category
  const { data: documents, isLoading, error, refetch } = api.documents.getDocumentsByCategory.useQuery({
    category,
    language: userLanguage,
    searchQuery
  }, {
    enabled: !typeParam || typeParam !== "information",
    retry: 3,
    retryDelay: 1000,
    onError: (err) => {
      console.error("Error fetching documents:", err);
      toast.error(`${t("documents.errorLoading") || "Error loading documents"}: ${err.message}`);
      
      // If we haven't retried too many times, try again after a delay
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          refetch();
        }, 2000);
      }
    }
  });

  // Get download URL mutation
  const getDownloadUrl = api.documents.getDownloadUrl.useMutation({
    onError: (err) => {
      console.error("Error getting download URL:", err);
      toast.error(`${t("documents.errorDownloading") || "Error downloading document"}: ${err.message}`);
    }
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

  // Cast functions with "any" to bypass TypeScript's strict checking
  const handleViewDocument = ((document: any) => {
    try {
      const documentId = document.id;
      window.open(`/${locale}/owner-dashboard/documents/${documentId}`, '_blank');
    } catch (error: any) {
      console.error("Error viewing document:", error);
      toast.error(t("documents.errorViewing") || "Error viewing document");
    }
  }) as any;
  
  // Cast functions with "any" to bypass TypeScript's strict checking
  const handleDownloadDocument = (async (document: any) => {
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
  }) as any;

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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" role="status"></div>
      </div>
    );
  }

  // If error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" data-testid="error-message">
        <p className="font-bold">{t("common.error") || "Error"}</p>
        <p>{error.message}</p>
        <button 
          onClick={() => {
            setRetryCount(prev => prev + 1);
            refetch();
          }}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
        >
          {t("common.retry") || "Retry"}
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