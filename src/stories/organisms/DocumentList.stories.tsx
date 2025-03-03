import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DocumentCategory, Language } from "@/lib/types";
import { I18nProvider } from "@/lib/i18n/client";
import { Search, Filter, Loader } from "lucide-react";
import { MockTRPCProvider } from "../../../.storybook/MockTRPCProvider";

// Mock version of DocumentCard that doesn't use real tRPC hooks
const MockDocumentCard = ({ 
  document, 
  showActions = true,
  onDelete,
  onView,
  onDownload 
}) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      if (onDelete) onDelete(document.id);
    }
  };
  
  const getFileIcon = () => {
    return (
      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </div>
    );
  };
  
  const getCategoryLabel = (category) => {
    switch (category) {
      case DocumentCategory.COMITE_DE_SUIVI:
        return "Comité de Suivi";
      case DocumentCategory.SOCIETE_DE_GESTION:
        return "Société de Gestion";
      case DocumentCategory.LEGAL:
        return "Legal";
      default:
        return category;
    }
  };
  
  const getLanguageLabel = (language) => {
    switch (language) {
      case Language.ENGLISH:
        return "English";
      case Language.FRENCH:
        return "French";
      case Language.ARABIC:
        return "Arabic";
      default:
        return language;
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex items-start">
          <div className="mr-4 flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
              {document.title}
            </h3>
            {document.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                {document.description}
              </p>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{formatDate(document.createdAt)}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{getLanguageLabel(document.language)}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{document.fileType.split('/').pop()}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{formatFileSize(document.fileSize)}</span>
              </div>
            </div>
            <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                {getCategoryLabel(document.category)}
              </span>
              <div className="flex items-center ml-3">
                <span>{document.viewCount || 0} views</span>
              </div>
              <div className="flex items-center ml-3">
                <span>{document.downloadCount || 0} downloads</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showActions && (
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-end">
          <button
            onClick={() => onView && onView(document)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4 flex items-center text-sm"
          >
            Preview
          </button>
          
          <button
            onClick={() => onDownload && onDownload(document)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-4 flex items-center text-sm"
          >
            Download
          </button>
          
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center text-sm"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Create a fully mocked version of DocumentList that doesn't rely on the real component
const MockedDocumentList = (props: any) => {
  const [documents, setDocuments] = useState(props.initialDocuments || []);
  const [filteredDocuments, setFilteredDocuments] = useState(props.initialDocuments || []);
  const [isLoading, setIsLoading] = useState(!props.initialDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(props.category);
  const [selectedLanguage, setSelectedLanguage] = useState(props.language);
  
  // Initialize documents on mount
  useEffect(() => {
    if (!props.initialDocuments) {
      const fetchDocuments = async () => {
        setIsLoading(true);
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDocuments([]);
        setFilteredDocuments([]);
        setIsLoading(false);
      };
      fetchDocuments();
    } else {
      setFilteredDocuments(props.initialDocuments);
    }
  }, [props.initialDocuments]);
  
  // Apply filters when documents or filter criteria change
  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedCategory, selectedLanguage]);
  
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterDocuments();
  };

  const handleDocumentDelete = (deletedId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== deletedId));
  };

  // This is a direct implementation, not using the real DocumentList component
  return (
    <div className="w-full">
      {/* Search and filters */}
      {(props.showSearch !== false || props.showFilters !== false) && (
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {props.showSearch !== false && (
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
          
          {props.showFilters !== false && (
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
            <MockDocumentCard
              key={doc.id}
              document={doc}
              showActions={props.showActions !== false}
              onDelete={handleDocumentDelete}
              onView={props.onView}
              onDownload={props.onDownload}
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
};

const meta: Meta<typeof MockedDocumentList> = {
  title: "Organisms/DocumentList",
  component: MockedDocumentList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MockTRPCProvider>
        <I18nProvider>
          <div className="max-w-7xl mx-auto">
            <Story />
          </div>
        </I18nProvider>
      </MockTRPCProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MockedDocumentList>;

const mockDocuments = [
  {
    id: "1",
    title: "HOA Meeting Minutes",
    description: "Minutes from the January 2023 HOA meeting",
    filePath: "/documents/meeting-minutes-jan-2023.pdf",
    fileSize: 1024 * 1024 * 2, // 2MB
    fileType: "application/pdf",
    category: DocumentCategory.GENERAL,
    language: Language.ENGLISH,
    authorId: "user-1",
    isTranslation: false,
    isPublished: true,
    viewCount: 45,
    downloadCount: 12,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    title: "Annual Budget",
    description: "Annual budget for the 2023 fiscal year",
    filePath: "/documents/annual-budget-2023.xlsx",
    fileSize: 1024 * 1024 * 1.5, // 1.5MB
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    category: DocumentCategory.FINANCE,
    language: Language.ENGLISH,
    authorId: "user-2",
    isTranslation: false,
    isPublished: true,
    viewCount: 32,
    downloadCount: 18,
    createdAt: new Date("2023-02-01"),
    updatedAt: new Date("2023-02-01"),
  },
  {
    id: "3",
    title: "Community Guidelines",
    description: "Updated community guidelines for 2023",
    filePath: "/documents/community-guidelines-2023.docx",
    fileSize: 1024 * 1024 * 1, // 1MB
    fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    category: DocumentCategory.LEGAL,
    language: Language.ENGLISH,
    authorId: "user-1",
    isTranslation: false,
    isPublished: true,
    viewCount: 67,
    downloadCount: 23,
    createdAt: new Date("2023-01-20"),
    updatedAt: new Date("2023-01-25"),
  },
];

export const Default: Story = {
  args: {
    initialDocuments: mockDocuments,
    showActions: true,
  },
};

export const WithoutSearch: Story = {
  args: {
    initialDocuments: mockDocuments,
    showSearch: false,
  },
};

export const WithoutFilters: Story = {
  args: {
    initialDocuments: mockDocuments,
    showFilters: false,
  },
};

export const WithoutActions: Story = {
  args: {
    initialDocuments: mockDocuments,
    showActions: false,
  },
};

export const SingleDocument: Story = {
  args: {
    initialDocuments: [mockDocuments[0]],
    showActions: true,
  },
}; 