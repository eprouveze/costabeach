"use client";

import { useState } from "react";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { DocumentCategory, Language } from "@/lib/types";
import { DocumentCard } from "./DocumentCard";
import { Loader2, FileX } from "lucide-react";

interface DocumentListProps {
  category: DocumentCategory;
  language?: Language;
  limit?: number;
  showActions?: boolean;
  className?: string;
}

export const DocumentList = ({
  category,
  language,
  limit = 10,
  showActions = true,
  className = "",
}: DocumentListProps) => {
  const [offset, setOffset] = useState(0);
  
  const { useDocumentsByCategory } = useDocuments();
  const { data, isLoading, isError, refetch } = useDocumentsByCategory(
    category,
    language,
    limit,
    offset
  );
  
  const handleNextPage = () => {
    if (data && data.length === limit) {
      setOffset(offset + limit);
    }
  };
  
  const handlePreviousPage = () => {
    if (offset >= limit) {
      setOffset(offset - limit);
    }
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading documents...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className={`flex flex-col items-center py-12 ${className}`}>
        <FileX className="h-12 w-12 text-red-500 mb-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          Failed to load documents
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          There was an error loading the documents. Please try again.
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div className={`flex flex-col items-center py-12 ${className}`}>
        <FileX className="h-12 w-12 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No documents found
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          There are no documents in this category yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-6">
        {data.map((document: any) => (
          <DocumentCard
            key={document.id}
            document={document}
            showActions={showActions}
            onDelete={handleRefresh}
          />
        ))}
      </div>
      
      {limit > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePreviousPage}
            disabled={offset === 0}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {Math.floor(offset / limit) + 1}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={!data || data.length < limit}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}; 