import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocumentPreview } from '@/components/DocumentPreview';
import { DocumentCategory, Language, Document, User } from '@/lib/types';

// Mock documents for preview
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Beach Access Regulations',
    description: 'Official regulations for beach access in Costa Beach',
    filePath: '/documents/beach-access.pdf',
    fileSize: 1024 * 1024 * 2.5, // 2.5MB
    fileType: 'application/pdf',
    category: DocumentCategory.LEGAL,
    language: Language.ENGLISH,
    isPublished: true,
    isTranslated: true,
    viewCount: 245,
    downloadCount: 87,
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-06-20'),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: 'John Administrator',
      email: 'john@costabeach.gov',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: 'admin' as const,
      isAdmin: true,
      isVerifiedOwner: true,
      preferredLanguage: Language.FRENCH,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: '2',
    title: 'Environmental Protection Guidelines',
    description: 'Guidelines for protecting the coastal environment',
    filePath: '/documents/environmental-guidelines.pdf',
    fileSize: 1024 * 1024 * 3.7, // 3.7MB
    fileType: 'application/pdf',
    category: DocumentCategory.COMITE_DE_SUIVI,
    language: Language.ENGLISH,
    isPublished: true,
    isTranslated: false,
    viewCount: 189,
    downloadCount: 62,
    createdAt: new Date('2023-07-10'),
    updatedAt: new Date('2023-07-10'),
    authorId: 'user2',
    author: {
      id: 'user2',
      name: 'Maria Rodriguez',
      email: 'maria@costabeach.gov',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      role: 'contentEditor' as const,
      isAdmin: false,
      isVerifiedOwner: true,
      preferredLanguage: Language.ARABIC,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: '3',
    title: 'Tourism Development Plan',
    description: 'Strategic plan for sustainable tourism development',
    filePath: '/documents/tourism-plan.pdf',
    fileSize: 1024 * 1024 * 5.2, // 5.2MB
    fileType: 'application/pdf',
    category: DocumentCategory.SOCIETE_DE_GESTION,
    language: Language.ENGLISH,
    isPublished: false,
    isTranslated: false,
    viewCount: 42,
    downloadCount: 18,
    createdAt: new Date('2023-08-05'),
    updatedAt: new Date('2023-08-20'),
    authorId: 'user3',
    author: {
      id: 'user3',
      name: 'Alex Johnson',
      email: 'alex@costabeach.gov',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      role: 'user' as const,
      isAdmin: false,
      isVerifiedOwner: false,
      preferredLanguage: Language.ENGLISH,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];

const DocumentBrowser = () => {
  const [selectedDocument, setSelectedDocument] = useState(mockDocuments[0]);
  const [translationRequested, setTranslationRequested] = useState(false);
  
  const handleRequestTranslation = (documentId: string) => {
    // In a real implementation, this would call the API to request a translation
    // await fetch(`/api/documents/${documentId}/request-translation`, { method: 'POST' });
    
    setTranslationRequested(true);
    setTimeout(() => setTranslationRequested(false), 3000);
  };

  const handleClose = () => {
    // In a real implementation, this would close the preview
    console.log('Closing preview');
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Document Browser</h1>
      
      {translationRequested && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Translation request submitted. You will be notified when the translation is ready.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Documents</h2>
          <div className="space-y-4">
            {mockDocuments.map(doc => (
              <div 
                key={doc.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedDocument?.id === doc.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDocument(doc)}
              >
                <h3 className="font-medium">{doc.title}</h3>
                <p className="text-sm text-gray-500 truncate">{doc.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {doc.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    {doc.language.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                    {doc.fileType.split('/')[1]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Document Preview</h2>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="mb-6">
              {selectedDocument ? (
                <DocumentPreview 
                  document={selectedDocument} 
                  onRequestTranslation={handleRequestTranslation}
                  onClose={handleClose}
                />
              ) : (
                <div className="p-6 border border-gray-200 rounded-lg text-center text-gray-500">
                  Select a document to preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof DocumentPreview> = {
  title: 'Components/DocumentPreview',
  component: DocumentPreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DocumentPreview>;

export const PDFPreview: Story = {
  args: {
    document: mockDocuments[0],
    onClose: () => console.log('Close clicked'),
    onRequestTranslation: (documentId: string) => console.log('Translation requested for', documentId),
  },
  parameters: {
    docs: {
      description: {
        story: 'Preview of a PDF document with translation request option.',
      },
    },
  },
};

export const ImagePreview: Story = {
  args: {
    document: mockDocuments[1],
    onClose: () => console.log('Close clicked'),
    onRequestTranslation: (documentId: string) => console.log('Translation requested for', documentId),
  },
  parameters: {
    docs: {
      description: {
        story: 'Preview of an image document.',
      },
    },
  },
};

export const UnsupportedFileType: Story = {
  args: {
    document: mockDocuments[2],
    onClose: () => console.log('Close clicked'),
    onRequestTranslation: (documentId: string) => console.log('Translation requested for', documentId),
  },
  parameters: {
    docs: {
      description: {
        story: 'Preview of a document with an unsupported file type (DOCX).',
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    document: mockDocuments[0],
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while the preview is being generated.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Override the mock to show loading state
      jest.mock('@/lib/hooks/useDocuments', () => ({
        useDocuments: () => ({
          previewDocument: async () => {
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 5000));
            return 'https://example.com/preview';
          },
          downloadDocument: async () => true,
          isLoading: true,
        }),
      }));
      
      return <Story />;
    },
  ],
};

export const ErrorState: Story = {
  args: {
    document: mockDocuments[0],
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when preview generation fails.',
      },
    },
  },
  decorators: [
    (Story) => {
      // Override the mock to show error state
      jest.mock('@/lib/hooks/useDocuments', () => ({
        useDocuments: () => ({
          previewDocument: async () => {
            throw new Error('Failed to generate preview');
          },
          downloadDocument: async () => true,
          isLoading: false,
        }),
      }));
      
      return <Story />;
    },
  ],
};

// Interactive example with document selection
export const InteractivePreview = () => {
  const [selectedDocument, setSelectedDocument] = useState(mockDocuments[0]);
  const [showPreview, setShowPreview] = useState(false);
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Document Preview System</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select a document to preview:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockDocuments.map((doc) => (
            <div 
              key={doc.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedDocument.id === doc.id 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
              }`}
              onClick={() => setSelectedDocument(doc)}
            >
              <h3 className="font-medium mb-2">{doc.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{doc.description}</p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="mr-2">{doc.fileType.split('/')[1].toUpperCase()}</span>
                <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          ))}
        </div>
        
        <button
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => setShowPreview(true)}
        >
          Preview Selected Document
        </button>
      </div>
      
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl h-[80vh]">
            <DocumentPreview
              document={selectedDocument}
              onClose={() => setShowPreview(false)}
              onRequestTranslation={() => console.log('Translation requested')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const S3DownloadWorkflow = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">S3 Download Workflow</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          The document download process uses AWS S3 for secure file retrieval. The workflow follows these steps:
        </p>
        <ol className="list-decimal pl-6 mb-4">
          <li className="mb-2">The client requests a signed URL from the server</li>
          <li className="mb-2">The server generates a time-limited signed URL for the S3 object</li>
          <li className="mb-2">The client uses the signed URL to download the file directly from S3</li>
          <li className="mb-2">The server tracks download metrics for analytics</li>
        </ol>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Implementation</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">1. Server-side: Generate Download URL</h3>
          <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            <pre className="text-sm">
{`// API route handler
import { getDownloadUrl } from '@/lib/utils/documents';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;
  
  try {
    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    
    if (!document) {
      return Response.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Generate a signed URL for downloading
    const downloadUrl = await getDownloadUrl(
      document.filePath,
      3600,  // 1 hour expiration
      true    // Force download
    );
    
    // Increment download count
    await prisma.document.update({
      where: { id: documentId },
      data: { downloadCount: { increment: 1 } }
    });
    
    return Response.json({ downloadUrl });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return Response.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}`}
            </pre>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">2. Client-side: Download File from S3</h3>
          <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            <pre className="text-sm">
{`// Client component
const downloadDocument = async (documentId: string, fileName: string) => {
  try {
    // Request a signed URL from the server
    const response = await fetch(\`/api/documents/\${documentId}/download\`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get download URL');
    }
    
    const { downloadUrl } = await response.json();
    
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
}`}
            </pre>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">3. Preview Generation</h3>
          <div className="bg-gray-100 p-4 rounded-md mb-4 overflow-x-auto">
            <pre className="text-sm">
{`// API route handler for preview URLs
import { getDownloadUrl } from '@/lib/utils/documents';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;
  
  try {
    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    
    if (!document) {
      return Response.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Check if preview is available for this file type
    const previewableTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'text/plain',
      'text/html',
      'application/json'
    ];
    
    const fileType = document.fileType.toLowerCase();
    const canPreview = previewableTypes.some(type => fileType.includes(type));
    
    if (!canPreview) {
      return Response.json(
        { error: 'Preview not available for this file type' },
        { status: 400 }
      );
    }
    
    // Generate a signed URL for preview (shorter expiration)
    const previewUrl = await getDownloadUrl(
      document.filePath,
      15 * 60,  // 15 minutes
      false     // Inline display
    );
    
    // Increment view count
    await prisma.document.update({
      where: { id: documentId },
      data: { viewCount: { increment: 1 } }
    });
    
    return Response.json({ previewUrl });
  } catch (error) {
    console.error('Error generating preview URL:', error);
    return Response.json(
      { error: 'Failed to generate preview URL' },
      { status: 500 }
    );
  }
}`}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Security Considerations</h2>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">
            <strong>Signed URLs</strong>: URLs expire after a short time (typically 1 hour for downloads, 15 minutes for previews)
          </li>
          <li className="mb-2">
            <strong>Access Control</strong>: Document access is verified before generating signed URLs
          </li>
          <li className="mb-2">
            <strong>Content Disposition</strong>: Download URLs include content disposition headers to ensure proper file handling
          </li>
          <li className="mb-2">
            <strong>Audit Logging</strong>: All downloads and views are tracked for audit purposes
          </li>
        </ul>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Example Implementation</h2>
        <p className="mb-4">
          Below is an example of the document preview component in action:
        </p>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <DocumentPreview 
            document={mockDocuments[0]} 
            onClose={() => console.log('Close clicked')}
            onRequestTranslation={() => console.log('Translation requested')}
          />
        </div>
      </div>
    </div>
  );
}; 