"use client";

import { useState, useEffect } from "react";
import { Document, Language } from "@/lib/types";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { X, Download, Languages, Loader } from "lucide-react";
import { api } from "@/lib/trpc";
import { toast } from "react-toastify";
import { useI18n } from "@/lib/i18n/client";

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
  onRequestTranslation?: (documentId: string) => void;
  className?: string;
}

export const DocumentPreview = ({
  document,
  onClose,
  onRequestTranslation,
  className = "",
}: DocumentPreviewProps) => {
  const { t } = useI18n();
  const { downloadDocument, previewDocument } = useDocuments();
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isTranslationRequested, setIsTranslationRequested] = useState(false);
  const [isTranslationInProgress, setIsTranslationInProgress] = useState(false);
  
  const translationStatus = api.translations.getTranslationStatus.useQuery(
    { 
      documentId: document.id,
      targetLanguage: Language.ENGLISH // Default to English or use a state variable if needed
    },
    {
      enabled: isTranslationRequested,
      refetchInterval: isTranslationInProgress ? 5000 : false, // Poll every 5 seconds if translation is in progress
    }
  );

  // Load document preview on mount
  useEffect(() => {
    loadPreview();
  }, [document.id]);

  const loadPreview = async () => {
    try {
      setIsLoading(true);
      const url = await previewDocument(document.id);
      
      // Determine preview type based on file extension
      const fileExtension = document.filePath.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'pdf') {
        setPreviewType('pdf');
        setPreviewUrl(url);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
        setPreviewType('image');
        setPreviewUrl(url);
      } else if (['txt', 'md', 'csv'].includes(fileExtension || '')) {
        setPreviewType('text');
        if (url) {
          const response = await fetch(url);
          const text = await response.text();
          setPreviewContent(text);
        } else {
          setPreviewContent('Unable to load document preview');
        }
      } else if (['html', 'htm'].includes(fileExtension || '')) {
        setPreviewType('html');
        if (url) {
          const response = await fetch(url);
          const html = await response.text();
          setPreviewContent(html);
        } else {
          setPreviewContent('Unable to load document preview');
        }
      } else if (['json'].includes(fileExtension || '')) {
        setPreviewType('json');
        if (url) {
          const response = await fetch(url);
          const json = await response.json();
          setPreviewContent(JSON.stringify(json, null, 2));
        } else {
          setPreviewContent('Unable to load document preview - URL is missing');
        }
      } else {
        setPreviewType('unsupported');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error(t('toast.documents.previewLoadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    await downloadDocument(document.id, document.title);
  };

  const handleRequestTranslation = async () => {
    if (onRequestTranslation) {
      onRequestTranslation(document.id);
    } else {
      try {
        setIsTranslationInProgress(true);
        setIsTranslationRequested(true);
        
        // Use fetch instead of tRPC for now to avoid build issues
        const response = await fetch('/api/translations/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: document.id,
            targetLanguage: 'en'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to request translation');
        }
        
        toast.info(t('toast.documents.translationRequested'));
      } catch (error) {
        console.error('Error requesting translation:', error);
        toast.error(t('toast.documents.translationRequestError'));
        setIsTranslationInProgress(false);
      }
    }
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4 mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Loading document preview...</p>
          </div>
        </div>
      );
    }

    switch (previewType) {
      case 'pdf':
        return (
          <iframe 
            src={previewUrl + '#toolbar=0'} 
            className="w-full h-full border-0" 
            title={document.title}
          />
        );
      
      case 'image':
        return (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <img 
              src={previewUrl || ''} 
              alt={document.title} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        );
      
      case 'text':
        return (
          <div className="p-6 h-full overflow-auto bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                {previewContent}
              </pre>
            </div>
          </div>
        );
      
      case 'html':
        return (
          <iframe 
            srcDoc={previewContent || ''} 
            className="w-full h-full border-0" 
            title={document.title}
            sandbox="allow-same-origin"
          />
        );
      
      case 'json':
        return (
          <div className="p-6 h-full overflow-auto bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                {previewContent}
              </pre>
            </div>
          </div>
        );
      
      case 'unsupported':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Preview not available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                This file type cannot be previewed in the browser. Download the file to view its contents.
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full font-medium"
              >
                <Download className="w-5 h-5 mr-2" />
                Download {document.fileType.split('/').pop()?.toUpperCase()} File
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 p-8 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error loading preview</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Something went wrong while loading the document preview. Please try downloading the file instead.
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg w-full font-medium"
              >
                <Download className="w-5 h-5 mr-2" />
                Download File
              </button>
            </div>
          </div>
        );
    }
  };

  const shouldShowTranslationButton = () => {
    // Translation is automated - never show translation button
    return false;
  };

  const getTranslationButtonText = () => {
    if (isTranslationInProgress) {
      return t("documents.translationStatus.inProgress");
    }
    
    if (translationStatus.data?.status === "pending") {
      return t("documents.translationStatus.pending");
    }
    
    if (translationStatus.data?.status === "processing") {
      return t("documents.translationStatus.processing");
    }
    
    return t("documents.translationStatus.requestTranslation");
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 ${className}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-t-xl">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl shadow-sm">
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{document.title}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {document.fileType.split('/').pop()?.toUpperCase()} • {Math.round(document.fileSize / 1024)} KB
                </span>
                <div className="flex items-center space-x-1">
                  {document.availableLanguages && document.availableLanguages.map((lang) => {
                    const isOriginal = lang === document.language;
                    const getFlag = (language: string) => {
                      switch (language) {
                        case 'french': return '🇫🇷';
                        case 'english': return '🇬🇧';
                        case 'arabic': return '🇲🇦';
                        default: return '🌐';
                      }
                    };
                    return (
                      <span 
                        key={lang}
                        className={`text-sm ${isOriginal ? 'ring-2 ring-blue-500 rounded-full p-0.5' : ''}`}
                        title={`${lang}${isOriginal ? ' (Original)' : ' (Translation)'}`}
                      >
                        {getFlag(lang)}
                        {isOriginal && <span className="text-xs text-blue-600 dark:text-blue-400 ml-0.5">★</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg flex items-center transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("documents.download")}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Preview content */}
        <div className="flex-1 overflow-hidden rounded-b-xl">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}; 