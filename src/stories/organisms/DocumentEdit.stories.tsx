import type { Meta, StoryObj } from '@storybook/react';
import { DocumentEdit } from '@/components/DocumentEdit';
import { DocumentCategory, Language } from '@/lib/types';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { I18nProvider } from '@/lib/i18n/client';

// Create a mock component that doesn't use tRPC directly
const MockDocumentEdit: React.FC<{
  title: string;
  description: string;
  category: DocumentCategory;
  language: Language;
  onSuccess?: boolean;
}> = ({ title, description, category, language, onSuccess = true }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  
  // Mock document data
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
  
  // Mock the component with direct prop callbacks instead of using tRPC hooks
  const MockedDocumentEdit = () => (
    <div className="document-edit-wrapper">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Document
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (onSuccess) {
                setTimeout(() => {
                  alert('Document updated successfully!');
                  setIsOpen(false);
                }, 1000);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    defaultValue={title}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter document title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    defaultValue={description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Enter document description"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    id="category"
                    defaultValue={category}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {Object.values(DocumentCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Reopen Editor
        </button>
      )}
    </div>
  );
  
  return (
    <I18nProvider locale="en">
      <div className="p-8 bg-gray-100">
        <MockedDocumentEdit />
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