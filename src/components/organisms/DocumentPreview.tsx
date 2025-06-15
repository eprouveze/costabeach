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
        <div className="flex items-center justify-center h-full">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
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
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <img 
              src={previewUrl || ''} 
              alt={document.title} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );
      
      case 'text':
        return (
          <div className="p-4 h-full overflow-auto bg-white dark:bg-gray-900 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{previewContent}</pre>
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
          <div className="p-4 h-full overflow-auto bg-white dark:bg-gray-900 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{previewContent}</pre>
          </div>
        );
      
      case 'unsupported':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-800 p-4 text-center">
            <p className="text-lg font-medium mb-2">Preview not available</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This file type cannot be previewed. Please download the file to view it.
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </button>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">Error loading preview</p>
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
      return "Translation in progress...";
    }
    
    if (translationStatus.data?.status === "pending") {
      return "Translation pending...";
    }
    
    if (translationStatus.data?.status === "processing") {
      return "Translation processing...";
    }
    
    return "Request Translation";
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 ${className}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">{document.title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {t("documents.download")}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
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