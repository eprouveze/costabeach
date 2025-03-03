import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DocumentCategory, Language } from "@/lib/types";
import { I18nProvider } from "@/lib/i18n/client";
import { Search, Filter, Loader } from "lucide-react";
import { DocumentCard } from "@/components/DocumentCard";

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
            <DocumentCard
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
      <I18nProvider>
        <div className="max-w-7xl mx-auto">
          <Story />
        </div>
      </I18nProvider>
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