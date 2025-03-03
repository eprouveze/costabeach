"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { DocumentCategory, Language, Permission } from "@/lib/types";

export default function AdminDocumentsPage() {
  const session = useSession();
  const router = useRouter();
  const [canManageAllDocuments, setCanManageAllDocuments] = useState(false);
  const [allowedCategories, setAllowedCategories] = useState<DocumentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check if user is authenticated
        if (!session.data?.user?.id) {
          toast.error("You must be logged in to access this page");
          router.push("/login");
          return;
        }

        // Fetch user permissions from API
        const response = await fetch(`/api/users/${session.data.user.id}/permissions`);
        if (!response.ok) {
          throw new Error("Failed to fetch user permissions");
        }
        
        const userData = await response.json();
        const userPermissions = userData.permissions || [];
        const isAdmin = userData.isAdmin || false;
        
        // Check if user can manage all documents or specific categories
        const canManageAll = isAdmin || userPermissions.includes(Permission.MANAGE_DOCUMENTS);
        setCanManageAllDocuments(canManageAll);
        
        // Determine allowed categories based on permissions
        const categories: DocumentCategory[] = [];
        
        if (canManageAll) {
          // Add all categories if user can manage all documents
          Object.values(DocumentCategory).forEach(category => categories.push(category));
        } else {
          // Add specific categories based on permissions
          if (userPermissions.includes(Permission.MANAGE_COMITE_DOCUMENTS)) {
            categories.push(DocumentCategory.COMITE_DE_SUIVI);
          }
          if (userPermissions.includes(Permission.MANAGE_SOCIETE_DOCUMENTS)) {
            categories.push(DocumentCategory.SOCIETE_DE_GESTION);
          }
          if (userPermissions.includes(Permission.MANAGE_LEGAL_DOCUMENTS)) {
            categories.push(DocumentCategory.LEGAL);
          }
        }
        
        setAllowedCategories(categories);
        
        // If user has no permissions to manage documents, redirect to home
        if (categories.length === 0 && !canManageAll) {
          toast.error("You don't have permission to manage documents");
          router.push("/");
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error verifying permissions:", error);
        toast.error("Failed to verify permissions");
        router.push("/");
      }
    };

    checkPermissions();
  }, [session, router]);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Document Management</h1>
      
      <div className="mb-4">
        <button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {showUploadForm ? "Cancel Upload" : "Upload New Document"}
        </button>
      </div>
      
      {showUploadForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
          <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
          {/* Document upload form would go here */}
          <p className="text-gray-500 mb-4">Document upload form placeholder</p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowUploadForm(false);
                toast.success("Document uploaded successfully");
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 mr-2"
            >
              Upload
            </button>
            <button
              onClick={() => setShowUploadForm(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        <p className="text-gray-500">Documents table placeholder</p>
      </div>
    </div>
  );
} 