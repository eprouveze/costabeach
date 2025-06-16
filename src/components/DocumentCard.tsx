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
  viewMode?: 'tiles' | 'list' | 'table';
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
}

export const DocumentCard = ({ 
  document, 
  onDelete, 
  showActions = true,
  viewMode = 'tiles',
  onView,
  onDownload: externalDownloadHandler
}: DocumentCardProps) => {
  const { t } = useI18n();
  const [showPreview, setShowPreview] = useState(false);
  const { downloadDocument } = useDocuments();
  
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
    // Always use modal preview instead of navigation
    setShowPreview(true);
  };
  
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  // Check if the file type can be previewed
  const canPreview = () => {
    const previewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/svg+xml',
      'text/plain',
      'text/html',
      'application/json'
    ];
    
    const fileType = document.fileType.toLowerCase();
    return previewableTypes.some(type => fileType.includes(type));
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
      case Language.ENGLISH:
        return "🇬🇧";
      case Language.FRENCH:
        return "🇫🇷";
      case Language.ARABIC:
        return "🇲🇦";
      default:
        return "🌐";
    }
  };

  const handleLanguageClick = (language: Language, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Find the document in the requested language
    if (language === document.language) {
      // This is the original document
      if (onView) onView(document);
    } else if (document.translations) {
      // Find the translation
      const translation = document.translations.find(t => t.language === language);
      if (translation && onView) {
        onView(translation);
      }
    }
  };
  
  if (viewMode === 'table') {
    return (
      <>
        <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Document Name & Icon */}
            <div className="col-span-5 flex items-center min-w-0">
              <div className="mr-3 flex-shrink-0">
                {getFileIcon(document.fileType)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate cursor-pointer transition-colors"
                  onClick={() => onView && onView(document)}
                >
                  {document.title}
                </h3>
                {document.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {document.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Category */}
            <div className="col-span-2 text-sm text-gray-700 dark:text-gray-300">
              {getCategoryLabel(document.category as DocumentCategory)}
            </div>
            
            {/* Languages */}
            <div className="col-span-2 flex items-center space-x-1">
              {document.availableLanguages ? 
                document.availableLanguages.map((lang: Language) => (
                  <button
                    key={lang}
                    onClick={(e) => handleLanguageClick(lang, e)}
                    className="text-lg hover:scale-110 transition-transform cursor-pointer"
                    title={getLanguageLabel(lang)}
                  >
                    {getLanguageFlag(lang)}
                  </button>
                )) :
                <span className="text-lg" title={getLanguageLabel(document.language as Language)}>
                  {getLanguageFlag(document.language as Language)}
                </span>
              }
            </div>
            
            {/* Size */}
            <div className="col-span-1 text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(document.fileSize)}
            </div>
            
            {/* Views */}
            <div className="col-span-1 text-sm text-gray-500 dark:text-gray-400">
              {document.viewCount || 0}
            </div>
            
            {/* Actions */}
            <div className="col-span-1 flex justify-end space-x-1">
              {canPreview() && (
                <button
                  onClick={handlePreview}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded transition-colors"
                  title={t("documents.preview")}
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={handleDownload}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded transition-colors"
                title={t("documents.download")}
              >
                <Download className="h-4 w-4" />
              </button>
              
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded transition-colors"
                  title={t("common.delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Document Preview Modal */}
        {showPreview && (
          <DocumentPreview
            document={document}
            onClose={handleClosePreview}
          />
        )}
      </>
    );
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="mr-4 flex-shrink-0">
                  {getFileIcon(document.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate cursor-pointer transition-colors"
                    onClick={() => onView && onView(document)}
                  >
                    {document.title}
                  </h3>
                  {document.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {document.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="bg-blue-100 dark:bg-blue-600 text-blue-800 dark:text-blue-100 px-2 py-1 rounded-full text-xs">
                  {getCategoryLabel(document.category as DocumentCategory)}
                </span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(document.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <HardDrive className="h-4 w-4 mr-1" />
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{document.viewCount || 0}</span>
                </div>
              </div>
              
              {showActions && (
                <div className="flex items-center space-x-2 ml-4">
                  {canPreview() && (
                    <button
                      onClick={handlePreview}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm"
                      title={t("documents.preview")}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={handleDownload}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm"
                    title={t("documents.download")}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center text-sm"
                      title={t("common.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Document Preview Modal */}
        {showPreview && (
          <DocumentPreview
            document={document}
            onClose={handleClosePreview}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-4">
          <div className="flex items-start">
            <div className="mr-4 flex-shrink-0">
              {getFileIcon(document.fileType)}
            </div>
            <div className="flex-1">
              <h3 
                className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-1 line-clamp-2 cursor-pointer transition-colors"
                onClick={() => onView && onView(document)}
              >
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
                  <Languages className="h-3 w-3 mr-1" />
                  <div className="flex space-x-1">
                    {document.availableLanguages ? 
                      document.availableLanguages.map((lang: Language) => (
                        <button
                          key={lang}
                          onClick={(e) => handleLanguageClick(lang, e)}
                          className="hover:scale-110 transition-transform cursor-pointer"
                          title={getLanguageLabel(lang)}
                        >
                          {getLanguageFlag(lang)}
                        </button>
                      )) :
                      <span title={getLanguageLabel(document.language as Language)}>
                        {getLanguageFlag(document.language as Language)}
                      </span>
                    }
                  </div>
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
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex flex-wrap justify-end gap-2">
            {canPreview() && (
              <button
                onClick={handlePreview}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-sm whitespace-nowrap"
              >
                <Eye className="h-4 w-4 mr-1" />
                {t("documents.preview")}
              </button>
            )}
            
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
        <DocumentPreview
          document={document}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
} 