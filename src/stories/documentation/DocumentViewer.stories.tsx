import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocumentPreview } from '@/components/organisms/DocumentPreview';
import { Document, DocumentCategory, Language } from '@/lib/types';
import MockTRPCProvider from '../../../.storybook/MockTRPCProvider';

// Create a MockDocumentPreview component that doesn't require tRPC context
const MockDocumentPreview = (props: React.ComponentProps<typeof DocumentPreview>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Mock the behavior of the DocumentPreview component
  const handleViewClick = async () => {
    setIsLoading(true);
    try {
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Set a mock preview URL based on the document type
      if (props.document.fileType.includes('pdf')) {
        setPreviewUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      } else if (props.document.fileType.includes('image')) {
        setPreviewUrl('https://placekitten.com/800/600');
      } else {
        setPreviewUrl('https://example.com/sample.txt');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to preview document'));
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically trigger preview on mount
  React.useEffect(() => {
    handleViewClick();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{props.document.title}</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Category:</span>
          <span>{props.document.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Language:</span>
          <span>{props.document.language}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">File Type:</span>
          <span>{props.document.fileType}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">File Size:</span>
          <span>{Math.round(props.document.fileSize / 1024)} KB</span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-2">Preview:</h3>
        {isLoading && <div className="p-4 text-center">Loading preview...</div>}
        {error && <div className="p-4 text-center text-red-600">Error loading preview: {error.message}</div>}
        {previewUrl && !isLoading && !error && (
          <div className="border rounded p-2 h-[400px] overflow-hidden">
            <iframe 
              src={previewUrl} 
              className="w-full h-full"
              title={`Preview of ${props.document.title}`}
            />
          </div>
        )}
      </div>

      {props.onRequestTranslation && props.document.language !== Language.ENGLISH && (
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => props.onRequestTranslation && props.onRequestTranslation(props.document.id)}
        >
          Request Translation
        </button>
      )}

      {props.onClose && (
        <button 
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 ml-2"
          onClick={props.onClose}
        >
          Close
        </button>
      )}
    </div>
  );
};

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

const meta: Meta<typeof MockDocumentPreview> = {
  title: 'Documentation/DocumentViewer',
  component: MockDocumentPreview,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <MockTRPCProvider>
        <div className="w-full max-w-4xl">
          <Story />
        </div>
      </MockTRPCProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MockDocumentPreview>;

export const Default: Story = {
  args: {
    document: mockDocument,
    onClose: () => console.log('Closed document preview'),
    className: 'max-h-[600px]',
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
    className: 'max-h-[600px]',
  },
};

export const TranslatedDocument: Story = {
  args: {
    document: mockTranslatedDocument,
    onClose: () => console.log('Closed document preview'),
    className: 'max-h-[600px]',
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
    className: 'max-h-[600px]',
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
    <MockTRPCProvider>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Translation Workflow</h2>
        <p className="mb-4">
          Current status: 
          {translationStatus === 'none' && <span className="text-gray-600"> No translation requested</span>}
          {translationStatus === 'pending' && <span className="text-yellow-600"> Translation in progress...</span>}
          {translationStatus === 'completed' && <span className="text-green-600"> Translation completed</span>}
        </p>
        
        <MockDocumentPreview
          document={currentDocument}
          onClose={() => console.log('Closed document preview')}
          onRequestTranslation={handleRequestTranslation}
          className="max-h-[600px] border border-gray-200 rounded-lg"
        />
      </div>
    </MockTRPCProvider>
  );
}; 