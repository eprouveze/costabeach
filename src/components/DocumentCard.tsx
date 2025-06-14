"use client";

import { useState } from "react";
import { Document, DocumentCategory, Language } from "@/lib/types";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { formatFileSize, formatDate } from "@/lib/utils/shared";
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Globe, 
  Calendar, 
  FileType, 
  HardDrive,
  Languages
} from "lucide-react";
import { DocumentPreview } from "./organisms/DocumentPreview";
import { api } from "@/lib/trpc";
import { toast } from "react-toastify";
import { useI18n } from "@/lib/i18n/client";

interface DocumentCardProps {
  document: Document;
  onDelete?: (deletedId: string) => void;
  showActions?: boolean;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
}

export const DocumentCard = ({ 
  document, 
  onDelete, 
  showActions = true,
  onView,
  onDownload: externalDownloadHandler
}: DocumentCardProps) => {
  const { t } = useI18n();
  const [showPreview, setShowPreview] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { downloadDocument } = useDocuments();
  const requestTranslation = api.translations.requestDocumentTranslation.useMutation();
  const utils = api.useContext();
  
  const handleDownload = async () => {
    if (externalDownloadHandler) {
      externalDownloadHandler(document);
    } else {
      await downloadDocument(document.id, document.title);
    }
  };
  
  const handleDelete = async () => {
    // Call the parent's delete handler directly - let the parent handle confirmation
    if (onDelete) {
      onDelete(document.id);
    }
  };
  
  const handlePreview = () => {
    if (onView) {
      onView(document);
    } else {
      setShowPreview(true);
    }
  };
  
  const handleClosePreview = () => {
    setShowPreview(false);
  };
  
  const handleRequestTranslation = async (documentId: string) => {
    try {
      setIsTranslating(true);
      // Get the user's preferred language or use a default
      const userPreferredLanguage = document.language === Language.ENGLISH 
        ? Language.FRENCH 
        : Language.ENGLISH;
      
      await requestTranslation.mutateAsync({
        documentId,
        targetLanguage: userPreferredLanguage,
      }, {
        onSuccess: () => {
          toast.success(`Translation to ${getLanguageLabel(userPreferredLanguage)} requested successfully`);
          // Invalidate queries to refresh document list
          utils.documents.getDocumentsByCategory.invalidate();
        },
        onError: (error) => {
          toast.error(`Translation request failed: ${error.message}`);
        }
      });
    } catch (error) {
      console.error("Translation request error:", error);
      toast.error("Failed to request translation. Please try again later.");
    } finally {
      setIsTranslating(false);
    }
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else if (fileType.includes("word") || fileType.includes("doc")) {
      return <FileText className="h-10 w-10 text-blue-500" />;
    } else if (fileType.includes("excel") || fileType.includes("sheet") || fileType.includes("csv")) {
      return <FileText className="h-10 w-10 text-green-500" />;
    } else if (fileType.includes("image")) {
      return <FileText className="h-10 w-10 text-purple-500" />;
    } else {
      return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };
  
  const getCategoryLabel = (category: DocumentCategory) => {
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
  
  const getLanguageLabel = (language: Language) => {
    switch (language) {
      case Language.ENGLISH:
        return t("languages.english");
      case Language.FRENCH:
        return t("languages.french");
      case Language.ARABIC:
        return t("languages.arabic");
      default:
        return language;
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-4">
          <div className="flex items-start">
            <div className="mr-4 flex-shrink-0">
              {getFileIcon(document.fileType)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {document.title}
              </h3>
              {document.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                  {document.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(document.createdAt)}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Globe className="h-3 w-3 mr-1" />
                  <span>{getLanguageLabel(document.language as Language)}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FileType className="h-3 w-3 mr-1" />
                  <span>{document.fileType.split('/').pop()}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <HardDrive className="h-3 w-3 mr-1" />
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>
              </div>
              <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full">
                  {getCategoryLabel(document.category as DocumentCategory)}
                </span>
                <div className="flex items-center ml-3">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{document.viewCount || 0}</span>
                </div>
                <div className="flex items-center ml-3">
                  <Download className="h-3 w-3 mr-1" />
                  <span>{document.downloadCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="bg-gray-50 px-4 py-3 flex flex-wrap justify-end gap-2">
            <button
              onClick={handlePreview}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm whitespace-nowrap"
            >
              <Eye className="h-4 w-4 mr-1" />
              {t("documents.preview")}
            </button>
            
            <button
              onClick={handleDownload}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm whitespace-nowrap"
            >
              <Download className="h-4 w-4 mr-1" />
              {t("documents.download")}
            </button>
            
            <button
              onClick={() => handleRequestTranslation(document.id)}
              disabled={isTranslating}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center text-sm disabled:opacity-50 whitespace-nowrap"
            >
              <Languages className="h-4 w-4 mr-1" />
              {isTranslating ? t("documents.requesting") : t("documents.translate")}
            </button>
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center text-sm whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("common.delete")}
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Document Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col">
            <DocumentPreview
              document={document}
              onClose={handleClosePreview}
              onRequestTranslation={handleRequestTranslation}
              className="max-h-full"
            />
          </div>
        </div>
      )}
    </>
  );
} 