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
  HardDrive
} from "lucide-react";

interface DocumentCardProps {
  document: Document;
  onDelete?: () => void;
  showActions?: boolean;
}

export const DocumentCard = ({ 
  document, 
  onDelete, 
  showActions = true 
}: DocumentCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { downloadDocument, deleteDocument } = useDocuments();
  
  const handleDownload = async () => {
    await downloadDocument(document.id, document.title);
  };
  
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setIsDeleting(true);
      const success = await deleteDocument(document.id, document.category as DocumentCategory);
      if (success && onDelete) {
        onDelete();
      }
      setIsDeleting(false);
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
        return "Comité de Suivi";
      case DocumentCategory.SOCIETE_DE_GESTION:
        return "Société de Gestion";
      case DocumentCategory.LEGAL:
        return "Legal";
      default:
        return category;
    }
  };
  
  const getLanguageLabel = (language: Language) => {
    switch (language) {
      case Language.ENGLISH:
        return "English";
      case Language.FRENCH:
        return "French";
      case Language.ARABIC:
        return "Arabic";
      default:
        return language;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
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
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-end">
          <button
            onClick={handleDownload}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4 flex items-center text-sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </button>
          
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center text-sm disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}; 