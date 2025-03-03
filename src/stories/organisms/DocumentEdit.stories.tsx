import type { Meta, StoryObj } from '@storybook/react';
import { DocumentEdit } from '@/components/DocumentEdit';
import { DocumentCategory, Language } from '@/lib/types';
import { api } from '@/lib/trpc/react';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { I18nProvider } from '@/lib/i18n/client';

// Mock the API
const mockApi = {
  documents: {
    updateDocument: {
      useMutation: () => ({
        mutate: async () => {
          return { success: true };
        },
        isLoading: false,
      }),
    },
  },
};

// Mock API for Storybook
jest.mock('@/lib/trpc/react', () => ({
  api: mockApi,
}));

// Mock component that doesn't need the actual tRPC context
const MockDocumentEdit: React.FC<{
  title: string;
  description: string;
  category: DocumentCategory;
  language: Language;
  onSuccess?: boolean;
}> = ({ title, description, category, language, onSuccess = true }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  
  const mockDocument = {
    id: 'doc-1',
    title,
    description,
    category,
    language,
    filePath: 'path/to/document.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    authorId: 'user-1',
    author: { id: 'user-1', name: 'John Doe' },
    viewCount: 5,
    downloadCount: 2,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return (
    <I18nProvider locale="en">
      <div className="p-8 bg-gray-100">
        {isOpen && (
          <DocumentEdit
            document={mockDocument}
            onClose={() => setIsOpen(false)}
            onSave={() => {
              if (onSuccess) {
                alert('Document updated successfully!');
                setIsOpen(false);
              }
            }}
          />
        )}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Reopen Editor
          </button>
        )}
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    </I18nProvider>
  );
};

const meta: Meta<typeof MockDocumentEdit> = {
  title: 'organisms/DocumentEdit',
  component: MockDocumentEdit,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    category: { 
      control: 'select', 
      options: Object.values(DocumentCategory) 
    },
    language: { 
      control: 'select', 
      options: Object.values(Language) 
    },
    onSuccess: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MockDocumentEdit>;

export const Default: Story = {
  args: {
    title: 'Annual Financial Report 2023',
    description: 'Detailed financial overview for Costa Beach 3 residence for the year 2023.',
    category: DocumentCategory.GENERAL,
    language: Language.EN,
    onSuccess: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default document edit modal with basic information',
      },
    },
  },
};

export const FinancialReport: Story = {
  args: {
    title: 'Financial Report Q2 2023',
    description: 'Quarterly financial report for Costa Beach 3 residence covering April to June 2023, including budget allocation, expenses, and maintenance costs.',
    category: DocumentCategory.FINANCE,
    language: Language.FR,
    onSuccess: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Financial document edit modal with French content',
      },
    },
  },
};

export const ComiteReport: Story = {
  args: {
    title: 'Meeting Minutes - July 2023',
    description: 'Minutes from the monthly committee meeting held on July 15, 2023 at the Costa Beach 3 community hall. Includes discussions on upcoming renovations and community events.',
    category: DocumentCategory.COMITE_REPORTS,
    language: Language.EN,
    onSuccess: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Committee report document edit modal',
      },
    },
  },
};

export const LegalDocument: Story = {
  args: {
    title: 'Property Regulations Update',
    description: 'Updated regulations for property usage and common areas at Costa Beach 3 residence. Effective from January 1, 2024.',
    category: DocumentCategory.LEGAL_DOCUMENTS,
    language: Language.AR,
    onSuccess: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Legal document edit modal with Arabic content',
      },
    },
  },
};

export const ErrorHandling: Story = {
  args: {
    title: 'Document with Error',
    description: 'This document will simulate an error when attempting to save.',
    category: DocumentCategory.GENERAL,
    language: Language.EN,
    onSuccess: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Document edit modal with error handling demonstration',
      },
    },
  },
}; 