"use client";

import { useState, useEffect } from "react";
import { Document, Language } from "@/lib/types";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { X, Download, Languages, Loader } from "lucide-react";
import { api } from "@/lib/trpc";
import { toast } from "react-toastify";

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
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isTranslationRequested, setIsTranslationRequested] = useState(false);
  const [isTranslationInProgress, setIsTranslationInProgress] = useState(false);
  const { getDocumentPreviewUrl, downloadDocument } = useDocuments();
  
  const translationStatus = api.translations.getDocumentTranslationStatus.useQuery(
    { documentId: document.id },
    {
      enabled: isTranslationRequested,
      refetchInterval: (data) => {
        // If translation is complete or failed, stop polling
        if (data?.status === "completed" || data?.status === "failed") {
          return false;
        }
        // Otherwise poll every 5 seconds
        return 5000;
      },
      onSuccess: (data) => {
        if (data?.status === "completed") {
          toast.success("Translation completed! Refreshing preview...");
          setIsTranslationInProgress(false);
          loadPreview(); // Reload the preview with the translated version
        } else if (data?.status === "failed") {
          toast.error("Translation failed. Please try again later.");
          setIsTranslationInProgress(false);
        }
      },
    }
  );

  // Load document preview on mount
  useEffect(() => {
    loadPreview();
  }, [document.id]);

  const loadPreview = async () => {
    try {
      setIsLoading(true);
      const url = await getDocumentPreviewUrl(document.id);
      
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
        const response = await fetch(url);
        const text = await response.text();
        setPreviewContent(text);
      } else if (['html', 'htm'].includes(fileExtension || '')) {
        setPreviewType('html');
        const response = await fetch(url);
        const html = await response.text();
        setPreviewContent(html);
      } else if (['json'].includes(fileExtension || '')) {
        setPreviewType('json');
        const response = await fetch(url);
        const json = await response.json();
        setPreviewContent(JSON.stringify(json, null, 2));
      } else {
        setPreviewType('unsupported');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load document preview');
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
        
        // Call the translation request endpoint
        await api.translations.requestDocumentTranslation.mutate({
          documentId: document.id
        });
        
        toast.info("Translation requested. This may take a few minutes.");
      } catch (error) {
        console.error('Error requesting translation:', error);
        toast.error('Failed to request translation');
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
    // Only show translation button if:
    // 1. The document is not already in the user's preferred language
    // 2. The document is not already being translated
    // 3. The document is not a translation itself
    return (
      !isTranslationInProgress && 
      !document.isTranslation &&
      document.language !== 'en' // Assuming 'en' is the user's preferred language
    );
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 ${className}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold truncate">{document.title}</h2>
          <div className="flex items-center space-x-2">
            {shouldShowTranslationButton() && (
              <button
                onClick={handleRequestTranslation}
                disabled={isTranslationInProgress}
                className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isTranslationInProgress
                    ? "bg-gray-200 text-gray-500 dark:bg-gray-700 cursor-not-allowed"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {isTranslationInProgress ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4 mr-2" />
                )}
                {getTranslationButtonText()}
              </button>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Preview content */}
        <div className="flex-1 overflow-hidden">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
}; 