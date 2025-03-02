"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/react";
import OwnerDashboardTemplate from "@/components/templates/OwnerDashboardTemplate";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { toast } from "react-toastify";

export default function DocumentViewerPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentDetails, setDocumentDetails] = useState<any>(null);

  // Fetch document details
  const { data: documents } = trpc.documents.getDocumentsByCategory.useQuery({
    documentId,
  });

  useEffect(() => {
    if (documents && documents.length > 0) {
      setDocumentDetails(documents[0]);
    }
  }, [documents]);

  // Get document preview URL
  useEffect(() => {
    const fetchDocumentUrl = async () => {
      try {
        setIsLoading(true);
        // Increment view count
        await trpc.documents.incrementViewCount.mutate({ documentId });
        
        // For preview, we'll use the download URL for now
        // In a real implementation, you might want to create a separate preview endpoint
        const result = await trpc.documents.getDownloadUrl.mutate({ 
          documentId,
          forPreview: true
        });
        
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

    if (documentId) {
      fetchDocumentUrl();
    }
  }, [documentId, t]);

  // Handle document download
  const handleDownload = async () => {
    try {
      const result = await trpc.documents.getDownloadUrl.mutate({ 
        documentId,
        forPreview: false
      });
      
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      } else {
        toast.error(t("documents.errorDownloadingDocument"));
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error(t("documents.errorDownloadingDocument"));
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen">
      <OwnerDashboardTemplate>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {documentDetails?.title || t("documents.viewingDocument")}
              </h1>
              {documentDetails && (
                <p className="text-sm text-gray-500 mt-1">
                  {t("documents.uploadedOn", { date: formatDate(documentDetails.createdAt) })}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t("documents.download")}</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="animate-pulse flex flex-col items-center">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ) : documentUrl ? (
            <div className="w-full h-[calc(100vh-240px)] min-h-[500px]">
              <iframe 
                src={documentUrl}
                className="w-full h-full border-0"
                title={documentDetails?.title || "Document Viewer"}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {t("documents.unableToPreview")}
              </h3>
              <p className="text-gray-500 mb-4 text-center max-w-md">
                {t("documents.previewNotAvailable")}
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t("documents.downloadInstead")}</span>
              </button>
            </div>
          )}
        </div>
      </OwnerDashboardTemplate>
    </main>
  );
} 