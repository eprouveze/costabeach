"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/trpc/react";
import { FileText, Download, ArrowLeft, Eye, Calendar, User, FileType } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { DocumentCategory, Language } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { fr, ar, enUS } from "date-fns/locale";

export default function DocumentViewerPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useParams();
  const documentId = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  // Derive language directly from locale to avoid stale queries
  const derivedLanguage: Language =
    locale === "fr" ? Language.FRENCH :
    locale === "ar" ? Language.ARABIC :
    Language.ENGLISH;

  // Set up mutations
  const incrementViewCount = api.documents.incrementViewCount.useMutation();
  const getDownloadUrl = api.documents.getDownloadUrl.useMutation();

  // Fetch the specific document by ID
  const { 
    data: documentDetails, 
    isLoading: isDocumentLoading, 
    error: documentError 
  } = api.documents.getDocumentById.useQuery(
    { documentId },
    { enabled: !!documentId }
  );

  // Track if view count has been incremented for this document
  const [viewCountIncremented, setViewCountIncremented] = useState(false);
  // Track if download URL has been fetched to prevent repeated calls
  const [downloadUrlFetched, setDownloadUrlFetched] = useState(false);
  // Track download button state to prevent spam clicking
  const [isDownloading, setIsDownloading] = useState(false);

  // Get document preview URL
  useEffect(() => {
    const fetchDocumentUrl = async () => {
      if (!documentDetails || downloadUrlFetched) return;
      
      try {
        setIsLoading(true);
        
        // Use the preview API endpoint
        const response = await fetch(`/api/documents/${documentId}/preview`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.previewUrl) {
            setDocumentUrl(result.previewUrl);
          } else {
            console.log("No preview URL in response");
          }
        } else {
          const errorData = await response.json();
          console.log("Preview not available:", errorData.error);
          // Don't show error toast for files that can't be previewed
        }
        setDownloadUrlFetched(true);
      } catch (error) {
        console.error("Error fetching document preview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (documentDetails && !downloadUrlFetched) {
      fetchDocumentUrl();
    }
  }, [documentDetails, documentId, downloadUrlFetched]);

  // Increment view count only once per document view
  useEffect(() => {
    if (documentDetails && !viewCountIncremented) {
      incrementViewCount.mutateAsync({ documentId }).catch((error) => {
        // Silently handle view count errors - this is non-critical
        console.warn('Failed to increment view count:', error);
      });
      setViewCountIncremented(true);
    }
  }, [documentDetails, documentId, viewCountIncremented, incrementViewCount]);

  const handleDownload = async () => {
    if (!documentDetails || isDownloading) return;
    
    try {
      setIsDownloading(true);
      const result = await getDownloadUrl.mutateAsync({ documentId });
      
      if (result.downloadUrl) {
        // Open the download URL in a new tab
        window.open(result.downloadUrl, "_blank");
      } else {
        toast.error(t("documents.errorDownloadingDocument"));
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error(t("documents.errorDownloadingDocument"));
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (date: Date) => {
    const dateLocale = locale === "fr" ? fr : locale === "ar" ? ar : enUS;
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: dateLocale
    });
  };

  const getCategoryName = (category: DocumentCategory) => {
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

  const getLanguageName = (language: Language) => {
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("common.back")}
        </button>
      </div>
      
      {isLoading || isDocumentLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-96 bg-gray-200 rounded w-full mb-4"></div>
          </div>
        </div>
      ) : documentDetails ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold mb-2">{documentDetails.title}</h1>
                <p className="text-gray-600">{documentDetails.description}</p>
              </div>
              
              {documentUrl ? (
                <div className="h-[600px] w-full">
                  <iframe 
                    src={documentUrl} 
                    className="w-full h-full border-0" 
                    title={documentDetails.title}
                  />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">{t("documents.previewNotAvailable")}</p>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`inline-flex items-center px-4 py-2 text-white rounded-md transition-colors ${
                      isDownloading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Download className={`h-4 w-4 mr-2 ${isDownloading ? 'animate-spin' : ''}`} />
                    {isDownloading ? t("documents.downloading") : t("documents.download")}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">{t("documents.documentDetails")}</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("documents.uploadedOn")}</p>
                    <p className="font-medium">{formatDate(documentDetails.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("documents.uploadedBy")}</p>
                    <p className="font-medium">{documentDetails.author?.name || t("common.unknown")}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FileType className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("documents.fileType")}</p>
                    <p className="font-medium">{documentDetails.fileType.split('/')[1].toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Eye className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">{t("documents.views")}</p>
                    <p className="font-medium">{documentDetails.viewCount}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">{t("documents.category")}</p>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {getCategoryName(documentDetails.category as DocumentCategory)}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">{t("documents.language")}</p>
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {getLanguageName(documentDetails.language as Language)}
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`w-full flex items-center justify-center px-4 py-2 text-white rounded-md transition-colors ${
                      isDownloading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Download className={`h-4 w-4 mr-2 ${isDownloading ? 'animate-spin' : ''}`} />
                    {isDownloading ? t("documents.downloading") : t("documents.download")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("documents.documentNotFound")}</h2>
          <p className="text-gray-500 mb-4">
            {documentError?.message || t("documents.documentNotFoundDescription")}
          </p>
          <Link
            href={`/${locale}/owner-dashboard`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t("documents.browseDocuments")}
          </Link>
        </div>
      )}
    </div>
  );
}