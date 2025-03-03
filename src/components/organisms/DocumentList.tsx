"use client";

import { useState, useEffect } from "react";
import { Document, DocumentCategory, Language } from "@/lib/types";
import { DocumentCard } from "../DocumentCard";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { Search, Filter, Loader } from "lucide-react";
import { useRTL } from "@/lib/hooks/useRTL";

interface DocumentListProps {
  category?: DocumentCategory;
  language?: Language;
  initialDocuments?: Document[];
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  limit?: number;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
}

export const DocumentList = ({
  category,
  language,
  initialDocuments,
  showSearch = true,
  showFilters = true,
  showActions = true,
  limit,
  onView,
  onDownload
}: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments || []);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(!initialDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | undefined>(category);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | undefined>(language);
  const { getDocuments } = useDocuments();
  const { isRTL } = useRTL();

  // Fetch documents on mount if not provided
  useEffect(() => {
    if (!initialDocuments) {
      fetchDocuments();
    } else {
      setFilteredDocuments(initialDocuments);
    }
  }, [initialDocuments]);

  // Apply filters when documents or filter criteria change
  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory, selectedLanguage]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const fetchedDocuments = await getDocuments({
        category: selectedCategory,
        language: selectedLanguage,
        limit
      });
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterDocuments();
  };

  const filterDocuments = () => {
    let filtered = [...documents];
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }
    
    // Apply language filter
    if (selectedLanguage) {
      filtered = filtered.filter(doc => doc.language === selectedLanguage);
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(term) || 
        (doc.description && doc.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredDocuments(filtered);
  };

  const handleDocumentDelete = (deletedId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== deletedId));
  };

  return (
    <div className="w-full">
      {/* Search and filters */}
      {(showSearch || showFilters) && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {showSearch && (
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </form>
          )}
          
          {showFilters && (
            <div className="flex gap-2">
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory || undefined)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">All Categories</option>
                {Object.values(DocumentCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedLanguage || ""}
                onChange={(e) => setSelectedLanguage(e.target.value as Language || undefined)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">All Languages</option>
                {Object.values(Language).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      
      {/* Document list */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              showActions={showActions}
              onDelete={handleDocumentDelete}
              onView={onView}
              onDownload={onDownload}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No documents found</p>
        </div>
      )}
    </div>
  );
} 