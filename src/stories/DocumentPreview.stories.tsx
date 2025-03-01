import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Mock document data
const mockDocuments = [
  {
    id: '1',
    title: 'Annual Budget Report 2023',
    description: 'Financial report for the fiscal year 2023 including budget allocations and expenditures.',
    filePath: 'documents/financial/budget-2023.pdf',
    fileSize: 2457600, // 2.4 MB
    fileType: 'application/pdf',
    category: 'financial',
    language: 'fr',
    createdAt: '2023-05-15T10:30:00Z',
    author: {
      id: '101',
      name: 'Sophie Martin',
      role: 'admin'
    },
    viewCount: 45,
    downloadCount: 12
  },
  {
    id: '2',
    title: 'HOA Meeting Minutes - March 2023',
    description: 'Minutes from the quarterly homeowners association meeting held on March 10, 2023.',
    filePath: 'documents/meeting/minutes-march-2023.docx',
    fileSize: 1228800, // 1.2 MB
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'meeting',
    language: 'fr',
    createdAt: '2023-03-15T14:45:00Z',
    author: {
      id: '102',
      name: 'Jean Dupont',
      role: 'contentEditor'
    },
    viewCount: 32,
    downloadCount: 8
  },
  {
    id: '3',
    title: 'Pool Maintenance Schedule',
    description: 'Schedule for regular maintenance of the community pool and guidelines for residents.',
    filePath: 'documents/announcement/pool-maintenance.jpg',
    fileSize: 512000, // 500 KB
    fileType: 'image/jpeg',
    category: 'announcement',
    language: 'fr',
    createdAt: '2023-06-01T09:15:00Z',
    author: {
      id: '103',
      name: 'Ahmed Benali',
      role: 'contentEditor'
    },
    viewCount: 78,
    downloadCount: 23
  },
  {
    id: '4',
    title: 'Property Rules and Regulations',
    description: 'Official rules and regulations for Costa Beach property owners and residents.',
    filePath: 'documents/legal/rules-regulations.pdf',
    fileSize: 3686400, // 3.5 MB
    fileType: 'application/pdf',
    category: 'legal',
    language: 'fr',
    createdAt: '2023-01-10T11:20:00Z',
    author: {
      id: '101',
      name: 'Sophie Martin',
      role: 'admin'
    },
    viewCount: 120,
    downloadCount: 45
  }
];

// Mock component to display a document preview
const DocumentPreview = ({ document, onRequestTranslation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  
  // Function to simulate fetching a download URL from the server
  const getDownloadUrl = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the API to get a signed URL
      // const response = await fetch(`/api/documents/${document.id}/download`);
      // const { downloadUrl } = await response.json();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock download URL based on file type
      let mockUrl;
      if (document.fileType === 'application/pdf') {
        mockUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      } else if (document.fileType === 'image/jpeg' || document.fileType === 'image/png') {
        mockUrl = 'https://via.placeholder.com/800x600.png';
      } else {
        mockUrl = '#'; // Placeholder for other file types
      }
      
      // Increment download count (would be done server-side in real implementation)
      // await fetch(`/api/documents/${document.id}/increment-download`, { method: 'POST' });
      
      return mockUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      setError('Failed to generate download URL. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to load preview
  const loadPreview = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the API to get a signed URL for preview
      // const response = await fetch(`/api/documents/${document.id}/preview`);
      // const { previewUrl } = await response.json();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock preview URL based on file type
      let mockUrl;
      if (document.fileType === 'application/pdf') {
        mockUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      } else if (document.fileType === 'image/jpeg' || document.fileType === 'image/png') {
        mockUrl = 'https://via.placeholder.com/800x600.png';
      } else {
        throw new Error('Preview not available for this file type');
      }
      
      // Increment view count (would be done server-side in real implementation)
      // await fetch(`/api/documents/${document.id}/increment-view`, { method: 'POST' });
      
      setPreviewUrl(mockUrl);
    } catch (error) {
      console.error('Error loading preview:', error);
      setError('Preview not available for this file type. Please download the file to view it.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle download
  const handleDownload = async () => {
    const url = await getDownloadUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  // Function to handle translation request
  const handleRequestTranslation = () => {
    if (onRequestTranslation) {
      onRequestTranslation(document.id);
    }
  };
  
  // Determine if preview is available based on file type
  const isPreviewAvailable = document.fileType === 'application/pdf' || 
                            document.fileType === 'image/jpeg' || 
                            document.fileType === 'image/png';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">{document.title}</h2>
        <p className="text-gray-600 mb-4">{document.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {document.category}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            {document.language.toUpperCase()}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
            {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
            {document.fileType.split('/')[1]}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <span>Uploaded by {document.author.name} on {new Date(document.createdAt).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>{document.viewCount} views</span>
          <span className="mx-2">•</span>
          <span>{document.downloadCount} downloads</span>
        </div>
        
        {isPreviewAvailable ? (
          <div className="mb-4">
            <button
              onClick={loadPreview}
              disabled={isLoading || !!previewUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
            >
              {isLoading ? 'Loading...' : previewUrl ? 'Preview Loaded' : 'Load Preview'}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download
            </button>
            <p className="mt-2 text-sm text-gray-500">Preview not available for this file type.</p>
          </div>
        )}
        
        {document.language !== 'fr' && (
          <button
            onClick={handleRequestTranslation}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Request Translation to French
          </button>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
      
      {previewUrl && (
        <div className="border-t border-gray-200">
          {document.fileType === 'application/pdf' ? (
            <div className="h-[500px] w-full">
              <iframe 
                src={previewUrl} 
                className="w-full h-full" 
                title={document.title}
              />
            </div>
          ) : document.fileType.startsWith('image/') ? (
            <div className="p-4 flex justify-center">
              <img 
                src={previewUrl} 
                alt={document.title} 
                className="max-h-[500px] object-contain"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

// Mock component to display a list of documents with preview
const DocumentBrowser = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [translationRequested, setTranslationRequested] = useState(false);
  
  const handleRequestTranslation = (documentId) => {
    // In a real implementation, this would call the API to request a translation
    // await fetch(`/api/documents/${documentId}/request-translation`, { method: 'POST' });
    
    setTranslationRequested(true);
    setTimeout(() => setTranslationRequested(false), 3000);
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
          {selectedDocument ? (
            <DocumentPreview 
              document={selectedDocument} 
              onRequestTranslation={handleRequestTranslation}
            />
          ) : (
            <div className="p-6 border border-gray-200 rounded-lg text-center text-gray-500">
              Select a document to preview
            </div>
          )}
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
};

export default meta;
type Story = StoryObj<typeof DocumentPreview>;

export const Basic: Story = {
  args: {
    document: mockDocuments[0],
    onRequestTranslation: () => console.log('Translation requested'),
  },
};

export const ImagePreview: Story = {
  args: {
    document: mockDocuments[2],
    onRequestTranslation: () => console.log('Translation requested'),
  },
};

export const NoPreviewAvailable: Story = {
  args: {
    document: mockDocuments[1],
    onRequestTranslation: () => console.log('Translation requested'),
  },
};

export const WithBrowser: Story = {
  render: () => <DocumentBrowser />,
  parameters: {
    layout: 'fullscreen',
  },
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
import { getDownloadUrl } from '@/lib/s3';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;
  
  try {
    // Get document from database
    const document = await db.document.findUnique({
      where: { id: documentId }
    });
    
    if (!document) {
      return Response.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Generate a signed URL for downloading
    const downloadUrl = await getDownloadUrl(document.filePath);
    
    // Increment download count
    await db.document.update({
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
const downloadFile = async (documentId: string) => {
  try {
    // Request a signed URL from the server
    const response = await fetch(\`/api/documents/\${documentId}/download\`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get download URL');
    }
    
    const { downloadUrl } = await response.json();
    
    // Open the download URL in a new tab
    window.open(downloadUrl, '_blank');
    
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
import { getDownloadUrl } from '@/lib/s3';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;
  
  try {
    // Get document from database
    const document = await db.document.findUnique({
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
      'image/gif'
    ];
    
    if (!previewableTypes.includes(document.fileType)) {
      return Response.json(
        { error: 'Preview not available for this file type' },
        { status: 400 }
      );
    }
    
    // Generate a signed URL for preview (shorter expiration)
    const previewUrl = await getDownloadUrl(document.filePath, 15 * 60); // 15 minutes
    
    // Increment view count
    await db.document.update({
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
        <DocumentPreview 
          document={mockDocuments[0]} 
          onRequestTranslation={() => console.log('Translation requested')}
        />
      </div>
    </div>
  );
}; 