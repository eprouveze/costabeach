import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocumentPreview } from '@/components/DocumentPreview';
import { DocumentCategory, Language, Document, User } from '@/lib/types';

// Mock the useDocuments hook
jest.mock('@/lib/hooks/useDocuments', () => ({
  useDocuments: () => ({
    previewDocument: async (id: string) => {
      // Return different preview URLs based on document ID
      if (id === '1') {
        return 'https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf';
      } else if (id === '2') {
        return 'https://images.unsplash.com/photo-1682687982501-1e58ab814714';
      } else {
        return null;
      }
    },
    downloadDocument: async (documentId: string, fileName: string) => {
      console.log(`Mock downloading document: ${documentId}, ${fileName}`);
      return true;
    },
    isLoading: false
  })
}));

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

const meta: Meta<typeof DocumentPreview> = {
  title: 'Components/DocumentPreview',
  component: DocumentPreview,
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
type Story = StoryObj<typeof DocumentPreview>;

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
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the component looks when a translation can be requested.',
      },
    },
  },
}; 