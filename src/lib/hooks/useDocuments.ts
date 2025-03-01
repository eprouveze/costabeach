import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/lib/trpc/react";
import { DocumentCategory, Language } from "@/lib/types";

export const useDocuments = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const utils = api.useUtils();
  
  // Get documents by category
  const useDocumentsByCategory = (
    category: DocumentCategory,
    language?: Language,
    limit: number = 10,
    offset: number = 0
  ) => {
    const query = api.documents.getDocumentsByCategory.useQuery(
      { category, language, limit, offset },
      {
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    );
    
    // Handle errors outside the query options
    if (query.error) {
      toast.error(`Error fetching documents: ${query.error.message}`);
    }
    
    return query;
  };
  
  // Upload a document
  const uploadDocument = async (
    file: File,
    title: string,
    category: DocumentCategory,
    language: Language,
    description?: string,
    parentDocumentId?: string
  ) => {
    if (!file) {
      toast.error("Please select a file to upload");
      return null;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Step 1: Get a signed URL for uploading
      const getUploadUrlMutation = api.documents.getUploadUrl.useMutation();
      const { uploadUrl, filePath } = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category,
        language,
      });
      
      // Step 2: Upload the file to S3
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      // Create a promise to handle the upload
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error("Upload failed"));
        };
        
        xhr.send(file);
      });
      
      await uploadPromise;
      
      // Step 3: Create document record in database
      const createDocumentMutation = api.documents.createDocument.useMutation();
      const document = await createDocumentMutation.mutateAsync({
        title,
        description,
        filePath,
        fileSize: file.size,
        fileType: file.type,
        category,
        language,
        isPublished: true,
        parentDocumentId,
      });
      
      // Invalidate queries to refresh document lists
      utils.documents.getDocumentsByCategory.invalidate({ category });
      
      toast.success("Document uploaded successfully");
      return document;
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(`Error uploading document: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Download a document
  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      // Increment view count
      const incrementViewCountMutation = api.documents.incrementViewCount.useMutation();
      await incrementViewCountMutation.mutateAsync({ documentId });
      
      // Get download URL
      const getDownloadUrlMutation = api.documents.getDownloadUrl.useMutation();
      const { downloadUrl } = await getDownloadUrlMutation.mutateAsync({ documentId });
      
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error(`Error downloading document: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    }
  };
  
  // Delete a document
  const deleteDocument = async (documentId: string, category: DocumentCategory) => {
    try {
      const deleteDocumentMutation = api.documents.deleteDocument.useMutation();
      await deleteDocumentMutation.mutateAsync({ documentId });
      
      // Invalidate queries to refresh document lists
      utils.documents.getDocumentsByCategory.invalidate({ category });
      
      toast.success("Document deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(`Error deleting document: ${error instanceof Error ? error.message : "Unknown error"}`);
      return false;
    }
  };
  
  return {
    useDocumentsByCategory,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    isUploading,
    uploadProgress,
  };
};