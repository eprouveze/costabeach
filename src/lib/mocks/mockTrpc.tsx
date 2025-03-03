import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/lib/api/root';
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
      name: 'Admin User'
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
      name: 'Admin User'
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
      name: 'Admin User'
    }
  }
];

// Create a mock client
const createMockTRPCClient = () => {
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
      }
    }
  };
};

// Create a mock provider component
export function MockTRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [trpcClient] = React.useState(() => createMockTRPCClient());

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient as any} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
} 