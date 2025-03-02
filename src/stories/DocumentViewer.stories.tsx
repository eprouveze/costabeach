import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Document, DocumentCategory, Language } from '@/lib/types';
import { TRPCReactProvider } from '@/lib/trpc/react';
import { I18nProvider } from '@/lib/i18n/client';

// Mock document data
const mockDocument: Document = {
  id: '1',
  title: 'Annual HOA Meeting Minutes',
  description: 'Minutes from the annual HOA meeting held on January 15, 2023',
  filePath: '/documents/annual-meeting-minutes.pdf',
  fileSize: 1024 * 1024 * 2.5, // 2.5MB
  fileType: 'application/pdf',
  category: DocumentCategory.COMITE_DE_SUIVI,
  language: Language.ENGLISH,
  authorId: 'user-1',
  createdAt: new Date('2023-01-20'),
  updatedAt: new Date('2023-01-20'),
  isPublished: true,
  viewCount: 45,
  downloadCount: 12,
  isTranslated: false,
  translatedDocumentId: null,
};

const mockTranslatedDocument: Document = {
  ...mockDocument,
  id: '2',
  title: 'Procès-verbal de l\'assemblée annuelle de l\'HOA',
  language: Language.FRENCH,
  isTranslated: true,
  translatedDocumentId: '1',
};

// Mock hooks for Storybook
const mockUseDocuments = () => {
  return {
    downloadDocument: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Document downloaded');
          resolve(true);
        }, 1000);
      });
    },
    previewDocument: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Return a placeholder PDF URL for demonstration
          resolve('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        }, 1000);
      });
    },
  };
};

const meta: Meta<typeof DocumentPreview> = {
  title: 'Components/DocumentViewer',
  component: DocumentPreview,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <I18nProvider>
        <TRPCReactProvider>
          <div className="w-full max-w-4xl">
            <Story />
          </div>
        </TRPCReactProvider>
      </I18nProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DocumentPreview>;

export const Default: Story = {
  args: {
    document: mockDocument,
    onClose: () => console.log('Closed document preview'),
    className: 'max-h-[80vh]',
  },
};

export const WithTranslationRequest: Story = {
  args: {
    document: mockDocument,
    onClose: () => console.log('Closed document preview'),
    onRequestTranslation: (documentId) => {
      console.log(`Translation requested for document ${documentId}`);
      return Promise.resolve();
    },
    className: 'max-h-[80vh]',
  },
};

export const TranslatedDocument: Story = {
  args: {
    document: mockTranslatedDocument,
    onClose: () => console.log('Closed document preview'),
    className: 'max-h-[80vh]',
  },
};

export const TranslationInProgress: Story = {
  args: {
    document: {
      ...mockDocument,
      isTranslated: false,
    },
    onClose: () => console.log('Closed document preview'),
    onRequestTranslation: (documentId) => {
      console.log(`Translation requested for document ${documentId}`);
      return Promise.resolve();
    },
    className: 'max-h-[80vh]',
  },
  parameters: {
    mockData: [
      {
        path: 'trpc.translations.getTranslationStatus.useQuery',
        data: { status: 'pending' },
      },
    ],
  },
};

export const UnsupportedFileType: Story = {
  args: {
    document: {
      ...mockDocument,
      fileType: 'application/octet-stream',
      title: 'Unsupported File Type Example',
    },
    onClose: () => console.log('Closed document preview'),
    onRequestTranslation: (documentId) => {
      console.log(`Translation requested for document ${documentId}`);
      return Promise.resolve();
    },
    className: 'max-h-[80vh]',
  },
};

export const DocumentWithError: Story = {
  args: {
    document: mockDocument,
    onClose: () => console.log('Closed document preview'),
    className: 'max-h-[80vh]',
  },
  parameters: {
    mockData: [
      {
        path: 'useDocuments.previewDocument',
        error: new Error('Failed to load document preview'),
      },
    ],
  },
};

// Interactive example with translation workflow
export const InteractiveTranslationWorkflow = () => {
  const [currentDocument, setCurrentDocument] = useState<Document>(mockDocument);
  const [translationStatus, setTranslationStatus] = useState<'none' | 'pending' | 'completed'>('none');
  
  const handleRequestTranslation = async (documentId: string) => {
    console.log(`Translation requested for document ${documentId}`);
    setTranslationStatus('pending');
    
    // Simulate translation process
    setTimeout(() => {
      setTranslationStatus('completed');
      setCurrentDocument({
        ...currentDocument,
        isTranslated: true,
      });
    }, 3000);
    
    return Promise.resolve();
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Translation Workflow</h2>
      <p className="mb-4">
        Current status: 
        {translationStatus === 'none' && <span className="text-gray-600"> No translation requested</span>}
        {translationStatus === 'pending' && <span className="text-yellow-600"> Translation in progress...</span>}
        {translationStatus === 'completed' && <span className="text-green-600"> Translation completed</span>}
      </p>
      
      <DocumentPreview
        document={currentDocument}
        onClose={() => console.log('Closed document preview')}
        onRequestTranslation={handleRequestTranslation}
        className="max-h-[70vh] border border-gray-200 rounded-lg"
      />
    </div>
  );
}; 