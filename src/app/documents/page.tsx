"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { DocumentCategory, Language } from "@/lib/types";

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(DocumentCategory.COMITE_DE_SUIVI);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.FRENCH);
  
  const { data: documents, isLoading, error } = api.documents.getDocumentsByCategory.useQuery({
    category: selectedCategory,
    language: selectedLanguage,
    limit: 20,
    offset: 0
  });
  
  const downloadMutation = api.documents.getDownloadUrl.useMutation();
  
  const handleDownload = async (documentId: string) => {
    try {
      const result = await downloadMutation.mutateAsync({ documentId });
      // Open the download URL in a new tab
      window.open(result.downloadUrl, '_blank');
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };
  
  return (
    <div className="container mx-auto p-8 pt-20">
      <h1 className="text-3xl font-bold mb-6">Documents</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            {Object.values(DocumentCategory).map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as Language)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            {Object.values(Language).map((language) => (
              <option key={language} value={language}>
                {language.charAt(0).toUpperCase() + language.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-400">
          Error loading documents: {error.message}
        </div>
      )}
      
      {documents && documents.length === 0 && (
        <div className="bg-gray-100 p-4 rounded-md text-gray-700 mb-6 dark:bg-gray-800 dark:text-gray-300">
          No documents found for the selected category and language.
        </div>
      )}
      
      {documents && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <div 
              key={document.id} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-gray-700"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{document.title}</h3>
                {document.description && (
                  <p className="text-gray-600 mb-4 dark:text-gray-400">{document.description}</p>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {new Date(document.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    {(document.fileSize / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300">
                    {document.fileType.split('/').pop()?.toUpperCase()}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">
                    {document.viewCount} views
                  </span>
                </div>
                <button
                  onClick={() => handleDownload(document.id)}
                  className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 