"use client";

import { useState, useEffect } from "react";
import { Document } from "@/lib/types";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { X, Download, Languages, Loader } from "lucide-react";

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
  onRequestTranslation?: () => void;
  className?: string;
}

export const DocumentPreview = ({
  document,
  onClose,
  onRequestTranslation,
  className = "",
}: DocumentPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { downloadDocument, previewDocument } = useDocuments();
  
  useEffect(() => {
    loadPreview();
  }, [document.id]);
  
  const loadPreview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = await previewDocument(document.id);
      if (url) {
        setPreviewUrl(url);
      } else {
        setError("Failed to load document preview");
      }
    } catch (err) {
      console.error("Error loading preview:", err);
      setError("An error occurred while loading the preview");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = async () => {
    await downloadDocument(document.id, document.title);
  };
  
  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12" data-testid="loading-state">
          <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading preview...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12" data-testid="error-state">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadPreview}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            data-testid="retry-button"
          >
            Retry
          </button>
        </div>
      );
    }
    
    if (!previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12" data-testid="no-preview-state">
          <p className="text-gray-600 dark:text-gray-300">No preview available</p>
          <button
            onClick={handleDownload}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            data-testid="download-instead-button"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Instead
          </button>
        </div>
      );
    }
    
    // Render different preview based on file type
    if (document.fileType.includes("pdf")) {
      return (
        <iframe
          src={`${previewUrl}#toolbar=0`}
          className="w-full h-full border-0"
          title={document.title}
          data-testid="document-preview-iframe"
        />
      );
    } else if (document.fileType.includes("image")) {
      return (
        <div className="flex items-center justify-center h-full" data-testid="image-preview-container">
          <img
            src={previewUrl}
            alt={document.title}
            className="max-w-full max-h-full object-contain"
            data-testid="document-preview-image"
          />
        </div>
      );
    } else if (
      document.fileType.includes("text") ||
      document.fileType.includes("html") ||
      document.fileType.includes("json")
    ) {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title={document.title}
          data-testid="document-preview-iframe"
        />
      );
    } else {
      // For unsupported file types
      return (
        <div className="flex flex-col items-center justify-center h-full py-12" data-testid="unsupported-file-type">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Preview not available for this file type
          </p>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            data-testid="download-instead-button"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Instead
          </button>
        </div>
      );
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col ${className}`} data-testid="document-preview-container">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center" data-testid="document-preview-header">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate" data-testid="document-title">
          {document.title}
        </h2>
        <div className="flex items-center space-x-2">
          {onRequestTranslation && (
            <button
              onClick={onRequestTranslation}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full"
              title="Request Translation"
              data-testid="request-translation-button"
            >
              <Languages className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-full"
            title="Download"
            data-testid="download-button"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-full"
            title="Close"
            data-testid="close-button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-[400px] overflow-auto" data-testid="document-preview-content">
        {renderPreview()}
      </div>
    </div>
  );
}; 