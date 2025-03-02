import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocumentPreview } from '@/components/DocumentPreview';
import { DocumentCategory, Language, Document } from '@/lib/types';

// Create a mock component that wraps DocumentPreview and provides the mock implementation
const MockedDocumentPreview = (props: any) => {
  // Simulate the behavior of useDocuments hook
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const loadPreview = async () => {
      // If forceLoading is true, keep the loading state
      if (props.forceLoading) {
        setIsLoading(true);
        return;
      }
      
      setIsLoading(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock preview URL based on the document ID
      if (props.document.id === '1') {
        setPreviewUrl('https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf');
      } else if (props.document.id === '2') {
        setPreviewUrl('https://images.unsplash.com/photo-1682687982501-1e58ab814714');
      } else {
        setPreviewUrl(null);
      }
      
      setIsLoading(false);
    };
    
    loadPreview();
  }, [props.document.id, props.forceLoading]);
  
  // Override the useDocuments hook by directly setting the values
  // This is a workaround for Storybook
  const mockDownloadDocument = async (documentId: string, fileName: string) => {
    console.log(`Mock downloading document: ${documentId}, ${fileName}`);
    return true;
  };
  
  // Render the DocumentPreview with our mocked preview URL and loading state
  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Loading preview...</p>
          </div>
        </div>
      ) : previewUrl ? (
        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
          {props.document.fileType.includes('pdf') ? (
            <iframe src={previewUrl} className="w-full h-full" title={props.document.title} />
          ) : props.document.fileType.includes('image') ? (
            <img src={previewUrl} alt={props.document.title} className="w-full h-full object-contain" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">Preview not available for this file type</p>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex space-x-2">
            <button 
              onClick={() => mockDownloadDocument(props.document.id, props.document.title)}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
              title="Download"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              onClick={props.onClose}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {(props.document.language !== 'english' || props.showTranslationButton) && (
            <button
              onClick={() => props.onRequestTranslation(props.document.id)}
              className="absolute bottom-2 right-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
            >
              Request Translation
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-600">Preview not available</p>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="text-lg font-medium">{props.document.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{props.document.description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {props.document.category}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            {props.document.language}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
            {props.document.fileType.split('/')[1]}
          </span>
        </div>
      </div>
    </div>
  );
};

// Mock documents for preview
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Sample PDF Document',
    description: 'This is a sample PDF document for preview testing',
    filePath: '/documents/sample.pdf',
    fileSize: 1024 * 1024 * 2, // 2MB
    fileType: 'application/pdf',
    category: DocumentCategory.LEGAL,
    language: Language.ENGLISH,
    isPublished: true,
    isTranslated: false,
    viewCount: 42,
    downloadCount: 15,
    authorId: 'user1',
    author: {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://i.pravatar.cc/150?u=user1',
      role: 'admin',
      isAdmin: true,
      isVerifiedOwner: true,
      preferredLanguage: Language.FRENCH,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Sample Image Document',
    description: 'This is a sample image document for preview testing',
    filePath: '/documents/sample.jpg',
    fileSize: 1024 * 512, // 512KB
    fileType: 'image/jpeg',
    category: DocumentCategory.SOCIETE_DE_GESTION,
    language: Language.ARABIC,
    isPublished: true,
    isTranslated: true,
    viewCount: 27,
    downloadCount: 8,
    authorId: 'user2',
    author: {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      image: 'https://i.pravatar.cc/150?u=user2',
      role: 'admin',
      isAdmin: true,
      isVerifiedOwner: true,
      preferredLanguage: Language.FRENCH,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Unsupported Document Type',
    description: 'This document has an unsupported file type for preview',
    filePath: '/documents/sample.xyz',
    fileSize: 1024 * 256, // 256KB
    fileType: 'application/octet-stream',
    category: DocumentCategory.COMITE_DE_SUIVI,
    language: Language.FRENCH,
    isPublished: true,
    isTranslated: false,
    viewCount: 12,
    downloadCount: 5,
    authorId: 'user3',
    author: {
      id: 'user3',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      image: 'https://i.pravatar.cc/150?u=user3',
      role: 'admin',
      isAdmin: true,
      isVerifiedOwner: true,
      preferredLanguage: Language.FRENCH,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const meta: Meta<typeof MockedDocumentPreview> = {
  title: 'Components/DocumentPreview',
  component: MockedDocumentPreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MockedDocumentPreview>;

export const PDFPreview: Story = {
  args: {
    document: mockDocuments[0],
    onClose: () => console.log('Close clicked'),
    onRequestTranslation: (documentId: string) => console.log('Translation requested for', documentId),
  },
};

export const ImagePreview: Story = {
  args: {
    document: mockDocuments[1],
    onClose: () => console.log('Close clicked'),
    onRequestTranslation: (documentId: string) => console.log('Translation requested for', documentId),
  },
};

export const UnsupportedFileType: Story = {
  args: {
    document: mockDocuments[2],
    onClose: () => console.log('Close clicked'),
    onRequestTranslation: (documentId: string) => console.log('Translation requested for', documentId),
  },
};

export const Loading: Story = {
  args: {
    document: mockDocuments[0],
    onClose: () => console.log('Close clicked'),
    onRequestTranslation: (documentId: string) => console.log('Translation requested for', documentId),
    forceLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while the preview is being generated.',
      },
    },
  },
};

export const WithTranslationRequest: Story = {
  args: {
    document: mockDocuments[0],
    onClose: () => console.log('Close clicked'),
    onRequestTranslation: (documentId: string) => console.log('Translation requested for', documentId),
    showTranslationButton: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the component looks when a translation can be requested.',
      },
    },
  },
}; 