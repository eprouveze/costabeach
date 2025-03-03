import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DocumentList } from "@/components/organisms/DocumentList";
import { DocumentCategory, Language } from "@/lib/types";
import { I18nProvider } from "@/lib/i18n/client";
import MockTRPCProvider from "../../../.storybook/MockTRPCProvider";

// Create a mocked version of the DocumentList component
// This avoids the need for real tRPC hooks
const MockedDocumentList = (props: any) => {
  const [documents, setDocuments] = useState(props.initialDocuments || []);
  const [isLoading, setIsLoading] = useState(!props.initialDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState(props.initialDocuments || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(props.category);
  const [selectedLanguage, setSelectedLanguage] = useState(props.language);
  
  // Mock the useDocuments hook functions
  const mockGetDocuments = async () => {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return props.initialDocuments || [];
  };
  
  // Initialize documents on mount
  useEffect(() => {
    if (!props.initialDocuments) {
      const fetchDocuments = async () => {
        setIsLoading(true);
        const docs = await mockGetDocuments();
        setDocuments(docs);
        setFilteredDocuments(docs);
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

  // Render the DocumentList with proper props
  return (
    <div className="max-w-7xl mx-auto">
      <DocumentList
        {...props}
        initialDocuments={filteredDocuments}
        // Override hooks with our mocked versions
        getDocuments={mockGetDocuments}
      />
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
        <Story />
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