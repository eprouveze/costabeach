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
  const documentId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentDetails, setDocumentDetails] = useState<any>(null);
  const [userLanguage, setUserLanguage] = useState<Language>(Language.FRENCH);

  // Set up mutations
  const incrementViewCount = api.documents.incrementViewCount.useMutation();
  const getDownloadUrl = api.documents.getDownloadUrl.useMutation();

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

  // Fetch all documents and filter by ID
  // Since there's no direct getDocumentById endpoint, we'll fetch by category and filter
  const comiteDocuments = api.documents.getDocumentsByCategory.useQuery({
    category: DocumentCategory.COMITE_DE_SUIVI,
    language: userLanguage
  });

  const societeDocuments = api.documents.getDocumentsByCategory.useQuery({
    category: DocumentCategory.SOCIETE_DE_GESTION,
    language: userLanguage
  });

  const legalDocuments = api.documents.getDocumentsByCategory.useQuery({
    category: DocumentCategory.LEGAL,
    language: userLanguage
  });

  // Find the document by ID from all categories
  useEffect(() => {
    const allDocuments = [
      ...(comiteDocuments.data || []),
      ...(societeDocuments.data || []),
      ...(legalDocuments.data || [])
    ];
    
    const document = allDocuments.find(doc => doc.id === documentId);
    if (document) {
      setDocumentDetails(document);
    }
  }, [documentId, comiteDocuments.data, societeDocuments.data, legalDocuments.data]);

  // Get document preview URL and increment view count
  useEffect(() => {
    const fetchDocumentUrl = async () => {
      if (!documentDetails) return;
      
      try {
        setIsLoading(true);
        // Increment view count
        await incrementViewCount.mutateAsync({ documentId });
        
        // For preview, we'll use the download URL for now
        // In a real implementation, you might want to create a separate preview endpoint
        const result = await getDownloadUrl.mutateAsync({ documentId });
        
        if (result.downloadUrl) {
          setDocumentUrl(result.downloadUrl);
        } else {
          toast.error(t("documents.errorLoadingDocument"));
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error(t("documents.errorLoadingDocument"));
      } finally {
        setIsLoading(false);
      }
    };

    if (documentDetails) {
      fetchDocumentUrl();
    }
  }, [documentDetails, documentId, t, incrementViewCount, getDownloadUrl]);

  const handleDownload = async () => {
    if (!documentDetails) return;
    
    try {
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
      
      {isLoading ? (
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
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("documents.download")}
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
                    {getCategoryName(documentDetails.category)}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">{t("documents.language")}</p>
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {getLanguageName(documentDetails.language)}
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("documents.download")}
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
          <p className="text-gray-500 mb-4">{t("documents.documentNotFoundDescription")}</p>
          <Link
            href="/owner-dashboard/documents"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t("documents.browseDocuments")}
          </Link>
        </div>
      )}
    </div>
  );
} 