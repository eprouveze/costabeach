"use client";

import { useState, useEffect } from "react";
import { Document, DocumentCategory, Language } from "@/lib/types";
import { DocumentCard } from "./DocumentCard";
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
  const rtl = useRTL();

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
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  const handleDocumentDelete = (deletedId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== deletedId));
  };

  // Apply limit if specified
  const displayDocuments = limit 
    ? filteredDocuments.slice(0, limit) 
    : filteredDocuments;

  return (
    <div className={rtl.getContentClass(false, false)}>
      {(showSearch || showFilters) && (
        <div className={`mb-6 ${rtl.getFlexClass()} flex-col md:flex-row gap-4`}>
          {showSearch && (
            <form onSubmit={handleSearch} className={`flex-1 ${rtl.getFlexClass()}`}>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className={`w-full p-2 border rounded-md ${rtl.getTextAlignClass()}`}
                />
                <button
                  type="submit"
                  className={`absolute ${rtl.isRTL ? 'left-2' : 'right-2'} top-2 text-gray-500`}
                >
                  <Search size={20} />
                </button>
              </div>
            </form>
          )}
          
          {showFilters && (
            <div className={rtl.getFlexClass()}>
              <button className={`${rtl.getFlexClass()} items-center gap-2 px-4 py-2 border rounded-md`}>
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin mr-2" />
          <span>Loading documents...</span>
        </div>
      ) : displayDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDocuments.map((document) => (
            <DocumentCard 
              key={document.id} 
              document={document} 
              showActions={showActions}
              onDelete={() => handleDocumentDelete(document.id)}
            />
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${rtl.getTextAlignClass()}`}>
          <p className="text-gray-500">No documents found.</p>
        </div>
      )}
    </div>
  );
}; 