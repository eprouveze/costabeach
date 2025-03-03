"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSearchParams } from "next/navigation";
import { DocumentList } from "./organisms/DocumentList";
import { api } from "@/lib/trpc";
import { DocumentCategory, Language } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";

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
  const { data: documents, isLoading, error } = api.documents.getDocumentsByCategory.useQuery({
    category,
    language: userLanguage,
    searchQuery
  }, {
    enabled: !typeParam || typeParam !== "information"
  });

  // Get download URL mutation
  const getDownloadUrl = api.documents.getDownloadUrl.useMutation();
  
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{t("common.error")}: {error.message}</p>
      </div>
    );
  }

  // If no documents
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-medium mb-2">{t("documents.noDocuments")}</h2>
        <p className="text-gray-500">{t("documents.noDocumentsInCategory")}</p>
      </div>
    );
  }

  // Format documents for the DocumentList component
  const formattedDocuments = documents.map(doc => ({
    id: doc.id,
    title: doc.title,
    description: doc.description || "",
    type: doc.fileType,
    dateUploaded: formatDate(doc.createdAt),
    fileSize: formatFileSize(doc.fileSize)
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        {categoryParam 
          ? t(`documents.categories.${categoryParam.toLowerCase()}`) || categoryParam
          : t("documents.title")}
      </h2>
      <DocumentList 
        documents={formattedDocuments} 
        onView={handleViewDocument}
        onDownload={handleDownloadDocument}
      />
    </div>
  );
} 