/**
 * Enhanced tRPC mock for Storybook
 * 
 * This implementation properly handles the tRPC context needed by components
 * and prevents the "__untypedClient" error that occurs in Storybook.
 */

import React from 'react';
import { type AppRouter } from '@/lib/api/root';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { DocumentCategory, Language, type Document, Permission } from '@/lib/types';

// Create a mock tRPC instance
export const api = createTRPCReact<AppRouter>();

// Mock document data
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Financial Report Q2 2023',
    description: 'Quarterly financial report for Q2 2023',
    filePath: 'documents/financial/report-q2-2023.pdf',
    fileSize: 1024 * 1024 * 2, // 2MB
    fileType: 'application/pdf',
    category: DocumentCategory.COMITE_DE_SUIVI,
    language: Language.FRENCH,
    isTranslated: false,
    isPublished: true,
    viewCount: 45,
    downloadCount: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      isAdmin: true,
      isVerifiedOwner: true,
      preferredLanguage: Language.FRENCH,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      permissions: [Permission.MANAGE_DOCUMENTS, Permission.MANAGE_USERS]
    }
  },
  {
    id: '2',
    title: 'Management Contract',
    description: 'Property management contract',
    filePath: 'documents/legal/management-contract.pdf',
    fileSize: 1024 * 1024 * 1.5, // 1.5MB
    fileType: 'application/pdf',
    category: DocumentCategory.SOCIETE_DE_GESTION,
    language: Language.FRENCH,
    isTranslated: false,
    isPublished: true,
    viewCount: 32,
    downloadCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      isAdmin: true,
      isVerifiedOwner: true,
      preferredLanguage: Language.FRENCH,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      permissions: [Permission.MANAGE_DOCUMENTS, Permission.MANAGE_USERS]
    }
  },
  {
    id: '3',
    title: 'HOA Bylaws',
    description: 'Homeowners Association bylaws and regulations',
    filePath: 'documents/legal/hoa-bylaws.pdf',
    fileSize: 1024 * 1024 * 3, // 3MB
    fileType: 'application/pdf',
    category: DocumentCategory.LEGAL,
    language: Language.FRENCH,
    isTranslated: false,
    isPublished: true,
    viewCount: 67,
    downloadCount: 23,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      isAdmin: true,
      isVerifiedOwner: true,
      preferredLanguage: Language.FRENCH,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      permissions: [Permission.MANAGE_DOCUMENTS, Permission.MANAGE_USERS]
    }
  }
];

/**
 * This function creates a proper mock TRPC client that doesn't rely on
 * the actual client implementation, preventing the "__untypedClient" error.
 */
function createMockTRPCClient() {
  // Create handlers that return mock data
  return {
    documents: {
      getDocumentsByCategory: {
        useQuery: ({ category, language, limit }: { category: DocumentCategory, language?: Language, limit?: number }) => {
          // Filter documents by category and language
          let filteredDocs = mockDocuments.filter(doc => doc.category === category);
          
          if (language) {
            filteredDocs = filteredDocs.filter(doc => doc.language === language);
          }
          
          // Apply limit if provided
          if (limit && limit > 0) {
            filteredDocs = filteredDocs.slice(0, limit);
          }
          
          return {
            data: filteredDocs,
            isLoading: false,
            isError: false,
            error: null,
            refetch: () => Promise.resolve({ data: filteredDocs })
          };
        }
      },
      getDownloadUrl: {
        useMutation: () => ({
          mutateAsync: async ({ documentId }: { documentId: string }) => {
            return { downloadUrl: `https://example.com/download/${documentId}` };
          },
          mutate: ({ documentId }: { documentId: string }) => {
            return { downloadUrl: `https://example.com/download/${documentId}` };
          },
          isLoading: false
        })
      },
      incrementViewCount: {
        useMutation: () => ({
          mutateAsync: async ({ documentId }: { documentId: string }) => {
            return { success: true };
          },
          mutate: ({ documentId }: { documentId: string }) => {
            return { success: true };
          },
          isLoading: false
        })
      },
      searchDocuments: {
        useQuery: ({ query, category }: { query?: string, category?: DocumentCategory }) => {
          let results = [...mockDocuments];
          
          if (query) {
            results = results.filter(doc => 
              doc.title.toLowerCase().includes(query.toLowerCase()) || 
              doc.description.toLowerCase().includes(query.toLowerCase())
            );
          }
          
          if (category) {
            results = results.filter(doc => doc.category === category);
          }
          
          return {
            data: results,
            isLoading: false,
            isError: false,
            error: null,
            refetch: () => Promise.resolve({ data: results })
          };
        }
      }
    },
    translations: {
      requestTranslation: {
        useMutation: () => ({
          mutateAsync: async ({ documentId, targetLanguage }: { documentId: string, targetLanguage: Language }) => {
            return { success: true, jobId: 'mock-job-id' };
          },
          mutate: ({ documentId, targetLanguage }: { documentId: string, targetLanguage: Language }) => {
            return { success: true, jobId: 'mock-job-id' };
          },
          isLoading: false
        })
      },
      getTranslationStatus: {
        useQuery: ({ jobId }: { jobId: string }) => {
          return {
            data: { status: 'completed', translatedDocumentId: 'translated-doc-1' },
            isLoading: false,
            isError: false,
            error: null,
            refetch: () => Promise.resolve({ 
              data: { status: 'completed', translatedDocumentId: 'translated-doc-1' } 
            })
          };
        }
      }
    }
  };
}

/**
 * Enhanced MockTRPCProvider that creates a proper client with all required methods
 * to prevent the "__untypedClient" error in Storybook.
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  // Create a QueryClient with default options
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      },
    },
  }));

  // Create a mock client that handles all the necessary operations
  const [trpcClient] = React.useState(() => {
    return api.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
          // Empty headers to avoid fetch errors in Storybook
          headers: () => ({}),
        }),
      ],
    });
  });

  // Set up the context with mock data handlers
  const mockClient = createMockTRPCClient();

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {/* Use React context to provide our mock implementations */}
        <MockDataContext.Provider value={mockClient}>
          {children}
        </MockDataContext.Provider>
      </api.Provider>
    </QueryClientProvider>
  );
}

/**
 * Context for mock data to be used by components
 */
export const MockDataContext = React.createContext<ReturnType<typeof createMockTRPCClient> | null>(null);

/**
 * Hook to access mock data - components should use this instead of the actual tRPC hooks
 */
export function useMockData() {
  const context = React.useContext(MockDataContext);
  if (context === null) {
    throw new Error('useMockData must be used within a MockTRPCProvider');
  }
  return context;
} 