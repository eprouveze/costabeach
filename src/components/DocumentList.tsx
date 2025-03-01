"use client";

import { useState, useEffect } from "react";
import { Document, DocumentCategory, Language } from "@/lib/types";
import { DocumentCard } from "./DocumentCard";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { Search, Filter, Loader } from "lucide-react";

interface DocumentListProps {
  category?: DocumentCategory;
  language?: Language;
  initialDocuments?: Document[];
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  limit?: number;
}

export const DocumentList = ({
  category,
  language,
  initialDocuments,
  showSearch = true,
  showFilters = true,
  showActions = true,
  limit
}: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments || []);
  const [loading, setLoading] = useState(!initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const { getDocuments } = useDocuments();

  useEffect(() => {
    if (!initialDocuments) {
      fetchDocuments();
    }
  }, [category, language, initialDocuments]);

  useEffect(() => {
    if (documents.length > 0) {
      filterDocuments();
    }
  }, [searchQuery, documents]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const fetchedDocuments = await getDocuments(category, language, undefined, undefined, searchQuery);
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  const filterDocuments = () => {
    if (!searchQuery) {
      setFilteredDocuments(documents);
      return;
    }

    const filtered = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredDocuments(filtered);
  };

  const handleDocumentDelete = (deletedId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== deletedId));
  };

  const displayDocuments = filteredDocuments.length > 0 ? filteredDocuments : documents;
  const limitedDocuments = limit ? displayDocuments.slice(0, limit) : displayDocuments;

  return (
    <div className="space-y-4">
      {showSearch && (
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Search
          </button>
        </form>
      )}

      {showFilters && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Filters coming soon</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading documents...</span>
        </div>
      ) : limitedDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {limitedDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={() => handleDocumentDelete(doc.id)}
              showActions={showActions}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">No documents found.</p>
          {searchQuery && (
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Try adjusting your search query.
            </p>
          )}
        </div>
      )}
    </div>
  );
}; 