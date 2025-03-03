import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { I18nProvider } from '@/lib/i18n/client';
import { Document, DocumentCategory, Language } from '@/lib/types';
import { toast } from 'react-toastify';
import MockTRPCProvider from '../../../.storybook/MockTRPCProvider';

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

/**
 * # Translation Workflow
 * 
 * This document demonstrates the translation workflow in the Costa Beach HOA portal.
 * It shows how users can request translations of documents, check translation status, 
 * and view translated documents.
 */

// Mock components that would typically use tRPC
const RequestTranslationComponent = ({ documentId, onSuccess }: { documentId: string, onSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRequestTranslation = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Translation requested successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to request translation.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">Request Translation</h3>
      <p className="text-sm text-gray-600 mb-4">
        This document is in English. You can request a translation to French or Arabic.
      </p>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleRequestTranslation}
          disabled={isLoading}
        >
          {isLoading ? 'Requesting...' : 'Request to French'}
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleRequestTranslation}
          disabled={isLoading}
        >
          {isLoading ? 'Requesting...' : 'Request to Arabic'}
        </button>
      </div>
    </div>
  );
};

const TranslationStatusComponent = ({ documentId, status }: { documentId: string, status: 'pending' | 'completed' | 'error' | 'idle' }) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  
  React.useEffect(() => {
    if (status === 'pending') {
      // Simulate status changing after a delay
      const timer = setTimeout(() => {
        setCurrentStatus('completed');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  if (currentStatus === 'idle') {
    return null;
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <h3 className="text-lg font-medium mb-2">Translation Status</h3>
      
      {currentStatus === 'pending' && (
        <div className="flex items-center text-yellow-600">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Translation in progress... This may take a few minutes.</span>
        </div>
      )}
      
      {currentStatus === 'completed' && (
        <div className="text-green-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Translation completed. You can now view the document in your preferred language.</span>
        </div>
      )}
      
      {currentStatus === 'error' && (
        <div className="text-red-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>Error processing translation. Please try again later.</span>
        </div>
      )}
    </div>
  );
};

// Create a component for the Story
const TranslationWorkflowDemo = () => {
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'pending' | 'completed' | 'error'>('idle');
  
  const handleRequestTranslation = () => {
    setTranslationStatus('pending');
  };
  
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Document Translation Workflow</h1>
      
      <div className="p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold">{mockDocument.title}</h2>
        <p className="text-gray-600">{mockDocument.description}</p>
        <div className="mt-2 flex gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {mockDocument.category}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            {mockDocument.language}
          </span>
        </div>
      </div>
      
      <RequestTranslationComponent 
        documentId={mockDocument.id} 
        onSuccess={handleRequestTranslation} 
      />
      
      <TranslationStatusComponent 
        documentId={mockDocument.id}
        status={translationStatus}
      />
      
      {translationStatus === 'completed' && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Translated Document Available</h3>
          <p className="text-sm text-gray-600 mb-4">
            The document has been successfully translated. You can now view it in your preferred language.
          </p>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            View Translated Document
          </button>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">How Translation Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>User requests a document translation to their preferred language</li>
          <li>The system queues the translation request</li>
          <li>A background job processes the translation using DeepL API</li>
          <li>When ready, the translated document is stored as a new document with a link to the original</li>
          <li>Users are notified when their translations are ready</li>
          <li>The translated document is available to view in the user's preferred language</li>
        </ol>
      </div>
    </div>
  );
};

const meta: Meta<typeof TranslationWorkflowDemo> = {
  title: 'Documentation/TranslationWorkflow',
  component: TranslationWorkflowDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The document translation workflow showing how users can request, track, and view translated documents.',
      },
    },
  },
  decorators: [
    (Story) => (
      <MockTRPCProvider>
        <I18nProvider>
          <Story />
        </I18nProvider>
      </MockTRPCProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TranslationWorkflowDemo>;

export const Default: Story = {
  args: {},
}; 