"use client";

import { useState } from "react";
import { DocumentCategory, Language } from "@/lib/types";

// Mock implementation of useDocuments hook for Storybook
export const useDocuments = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock implementation of useDocumentsByCategory
  const useDocumentsByCategory = (
    category: DocumentCategory,
    language?: Language,
    limit: number = 10,
    offset: number = 0,
    searchQuery: string = ""
  ) => {
    return {
      data: [],
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve({ data: [] }),
    };
  };

  // Mock implementation of getDocuments
  const getDocuments = async (
    category?: DocumentCategory,
    language?: Language,
    limit: number = 10,
    offset: number = 0,
    searchQuery: string = ""
  ) => {
    return [];
  };
  
  // Mock implementation of uploadDocument
  const uploadDocument = async (
    file: File,
    title: string,
    category: DocumentCategory,
    language: Language,
    description?: string,
    parentDocumentId?: string
  ) => {
    setIsUploading(true);
    setUploadProgress(50);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUploadProgress(100);
    setIsUploading(false);
    
    return {
      id: 'mock-document-id',
      title,
      description,
      filePath: 'mock-file-path',
      fileSize: file.size,
      fileType: file.type,
      category,
      language,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      downloadCount: 0,
      isTranslated: false,
      authorId: 'mock-user-id',
    };
  };
  
  // Mock implementation of downloadDocument
  const downloadDocument = async (documentId: string, fileName: string) => {
    console.log(`Mock downloading document: ${documentId}, ${fileName}`);
    return true;
  };
  
  // Mock implementation of deleteDocument
  const deleteDocument = async (documentId: string, category: DocumentCategory) => {
    console.log(`Mock deleting document: ${documentId}`);
    return true;
  };
  
  // Mock implementation of previewDocument
  const previewDocument = async (id: string): Promise<string | null> => {
    setIsLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    
    // Return a mock preview URL based on the document ID
    if (id === '1') {
      return 'https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf';
    } else if (id === '2') {
      return 'https://images.unsplash.com/photo-1682687982501-1e58ab814714';
    } else {
      return null;
    }
  };
  
  return {
    useDocumentsByCategory,
    getDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    previewDocument,
    isUploading,
    uploadProgress,
    isLoading,
  };
};

export default useDocuments; 