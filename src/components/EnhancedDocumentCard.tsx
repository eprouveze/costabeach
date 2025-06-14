"use client";

import { useState } from "react";
import { Document, DocumentCategory, Language, TranslationQuality, TranslationStatus } from "@/lib/types";
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
  Languages,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Zap
} from "lucide-react";
import { DocumentPreview } from "./organisms/DocumentPreview";
import { api } from "@/lib/trpc";
import { toast } from "react-toastify";
import { useI18n } from "@/lib/i18n/client";

interface EnhancedDocumentCardProps {
  document: Document;
  translations?: Document[];
  onDelete?: (deletedId: string) => void;
  showActions?: boolean;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
}

export const EnhancedDocumentCard = ({ 
  document, 
  translations = [],
  onDelete, 
  showActions = true,
  onView,
  onDownload: externalDownloadHandler
}: EnhancedDocumentCardProps) => {
  const { t, locale } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(locale as Language);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { downloadDocument, deleteDocument } = useDocuments();
  
  // Get the document in the selected language, fallback to original
  const getDocumentForLanguage = (language: Language): Document => {
    if (language === document.sourceLanguage) {
      return document;
    }
    
    const translation = translations.find(t => t.language === language);
    return translation || document;
  };
  
  const currentDocument = getDocumentForLanguage(selectedLanguage);
  const isTranslation = currentDocument.id !== document.id;
  
  // Get available languages with their status
  const getLanguageAvailability = () => {
    const availability: Record<Language, { available: boolean; status: TranslationStatus; document?: Document }> = {
      [Language.FRENCH]: { available: false, status: TranslationStatus.PENDING },
      [Language.ENGLISH]: { available: false, status: TranslationStatus.PENDING },
      [Language.ARABIC]: { available: false, status: TranslationStatus.PENDING }
    };
    
    // Original document
    if (document.sourceLanguage) {
      availability[document.sourceLanguage as Language] = {
        available: true,
        status: TranslationStatus.COMPLETED,
        document: document
      };
    }
    
    // Translations
    translations.forEach(translation => {
      if (translation.language) {
        availability[translation.language as Language] = {
          available: true,
          status: translation.translationStatus || TranslationStatus.COMPLETED,
          document: translation
        };
      }
    });
    
    return availability;
  };
  
  const languageAvailability = getLanguageAvailability();
  
  const handleDownload = async () => {
    if (externalDownloadHandler) {
      externalDownloadHandler(currentDocument);
    } else {
      await downloadDocument(currentDocument.id, currentDocument.title);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm(t("documents.confirmDelete"))) {
      setIsDeleting(true);
      const success = await deleteDocument(document.id, document.category as DocumentCategory);
      if (success && onDelete) {
        onDelete(document.id);
      }
      setIsDeleting(false);
    }
  };
  
  const handlePreview = () => {
    if (onView) {
      onView(currentDocument);
    } else {
      setShowPreview(true);
    }
  };
  
  const handleClosePreview = () => {
    setShowPreview(false);
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
  
  const getLanguageFlag = (language: Language) => {
    switch (language) {
      case Language.FRENCH: return "🇫🇷";
      case Language.ENGLISH: return "🇬🇧";
      case Language.ARABIC: return "🇲🇦";
      default: return "🌐";
    }
  };
  
  const getTranslationQualityIcon = (quality?: TranslationQuality) => {
    switch (quality) {
      case TranslationQuality.ORIGINAL:
        return <span title="Original Document"><Shield className="h-3 w-3 text-blue-600" /></span>;
      case TranslationQuality.HUMAN:
        return <span title="Human Translation"><CheckCircle className="h-3 w-3 text-green-600" /></span>;
      case TranslationQuality.MACHINE:
        return <span title="Machine Translation"><Zap className="h-3 w-3 text-yellow-600" /></span>;
      case TranslationQuality.HYBRID:
        return <span title="Hybrid Translation"><Languages className="h-3 w-3 text-purple-600" /></span>;
      default:
        return null;
    }
  };
  
  const getStatusIcon = (status: TranslationStatus) => {
    switch (status) {
      case TranslationStatus.COMPLETED:
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case TranslationStatus.PROCESSING:
        return <Clock className="h-3 w-3 text-blue-500 animate-spin" />;
      case TranslationStatus.PENDING:
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case TranslationStatus.FAILED:
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };
  
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Language Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto scrollbar-hide">
            {Object.entries(languageAvailability).map(([lang, info]) => {
              const language = lang as Language;
              const isActive = selectedLanguage === language;
              const isAvailable = info.available;
              
              return (
                <button
                  key={language}
                  onClick={() => isAvailable && setSelectedLanguage(language)}
                  disabled={!isAvailable}
                  className={`
                    flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap
                    ${isActive 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400'
                    }
                    ${isAvailable 
                      ? 'hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <span>{getLanguageFlag(language)}</span>
                  <span>{getLanguageLabel(language)}</span>
                  {getStatusIcon(info.status)}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start">
            <div className="mr-4 flex-shrink-0">
              {getFileIcon(currentDocument.fileType)}
            </div>
            <div className="flex-1">
              {/* Translation Quality Indicator */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTranslationQualityIcon(currentDocument.translationQuality)}
                  {isTranslation && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {currentDocument.translationQuality === TranslationQuality.MACHINE 
                        ? t("documents.machineTranslation")
                        : t("documents.translation")
                      }
                    </span>
                  )}
                </div>
                {isTranslation && (
                  <button
                    onClick={() => setSelectedLanguage(document.sourceLanguage as Language)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t("documents.viewOriginal")}
                  </button>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {currentDocument.title}
              </h3>
              {currentDocument.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                  {currentDocument.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(currentDocument.createdAt)}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Globe className="h-3 w-3 mr-1" />
                  <span>{getLanguageLabel(currentDocument.language as Language)}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FileType className="h-3 w-3 mr-1" />
                  <span>{currentDocument.fileType.split('/').pop()}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <HardDrive className="h-3 w-3 mr-1" />
                  <span>{formatFileSize(currentDocument.fileSize)}</span>
                </div>
              </div>
              <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full">
                  {getCategoryLabel(currentDocument.category as DocumentCategory)}
                </span>
                <div className="flex items-center ml-3">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{currentDocument.viewCount || 0}</span>
                </div>
                <div className="flex items-center ml-3">
                  <Download className="h-3 w-3 mr-1" />
                  <span>{currentDocument.downloadCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex flex-wrap justify-end gap-2">
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
            
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center text-sm disabled:opacity-50 whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? t("documents.deleting") : t("common.delete")}
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
              document={currentDocument}
              onClose={handleClosePreview}
              className="max-h-full"
            />
          </div>
        </div>
      )}
    </>
  );
};