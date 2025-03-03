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

// Create a full proxy handler to catch all tRPC calls
// This prevents the "__untypedClient" error by providing a complete mock implementation
const createTRPCProxy = () => {
  // Generic proxy handler that returns fixtures for queries and mutations
  return new Proxy({}, {
    get: (target, prop) => {
      // Return a router proxy for each router (documents, translations, etc.)
      return new Proxy({}, {
        get: (routerTarget, routerProp) => {
          // Return a procedure proxy for each procedure within the router
          return new Proxy({}, {
            get: (procTarget, procProp) => {
              if (procProp === 'useQuery') {
                // Handle useQuery
                return (params: any) => mockQueryHandler(String(prop), String(routerProp), params);
              } else if (procProp === 'useMutation') {
                // Handle useMutation
                return () => mockMutationHandler(String(prop), String(routerProp));
              } else if (procProp === 'useInfiniteQuery') {
                // Handle useInfiniteQuery
                return (params: any) => mockInfiniteQueryHandler(String(prop), String(routerProp), params);
              } else if (procProp === 'useSubscription') {
                // Handle useSubscription
                return (params: any) => {
                  console.log(`[Mock tRPC] useSubscription called for ${String(prop)}.${String(routerProp)} with params:`, params);
                  return { isLoading: false, data: null };
                };
              } else {
                // Return a noop function for other procedure properties
                return () => console.log(`[Mock tRPC] Unhandled procedure property: ${String(procProp)}`);
              }
            }
          });
        }
      });
    }
  });
};

// Mock handler for useQuery
const mockQueryHandler = (router: string, procedure: string, params: any) => {
  console.log(`[Mock tRPC] useQuery called for ${router}.${procedure} with params:`, params);
  
  // Handle documents router
  if (router === 'documents') {
    if (procedure === 'getDocumentsByCategory') {
      let filteredDocs = [...mockDocuments];
      
      if (params?.category) {
        filteredDocs = filteredDocs.filter(doc => doc.category === params.category);
      }
      
      if (params?.language) {
        filteredDocs = filteredDocs.filter(doc => doc.language === params.language);
      }
      
      if (params?.searchQuery) {
        const query = params.searchQuery.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.title.toLowerCase().includes(query) || 
          doc.description.toLowerCase().includes(query)
        );
      }
      
      return {
        data: filteredDocs,
        isLoading: false,
        isError: false,
        error: null,
        refetch: () => Promise.resolve({ data: filteredDocs }),
        fetchStatus: 'idle',
        status: 'success',
        isFetching: false
      };
    }
  }
  
  // Handle translations router
  if (router === 'translations') {
    if (procedure === 'getTranslationStatus') {
      return {
        data: { status: 'completed', translatedDocumentId: 'translated-doc-1' },
        isLoading: false,
        isError: false,
        error: null,
        refetch: () => Promise.resolve({ 
          data: { status: 'completed', translatedDocumentId: 'translated-doc-1' } 
        }),
        fetchStatus: 'idle',
        status: 'success',
        isFetching: false
      };
    }
  }
  
  // Default fallback for unhandled queries
  return {
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => Promise.resolve({ data: null }),
    fetchStatus: 'idle',
    status: 'success',
    isFetching: false
  };
};

// Mock handler for useMutation
const mockMutationHandler = (router: string, procedure: string) => {
  console.log(`[Mock tRPC] useMutation called for ${router}.${procedure}`);
  
  // Common mutation properties
  const commonProps = {
    isLoading: false,
    isError: false,
    error: null,
    reset: () => {},
    context: undefined,
    data: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    isPending: false,
    isSuccess: true,
    status: 'idle',
    submittedAt: 0,
    variables: undefined
  };

  // Handle documents router
  if (router === 'documents') {
    if (procedure === 'getDownloadUrl') {
      return {
        ...commonProps,
        mutateAsync: async ({ documentId }: { documentId: string }) => {
          console.log(`[Mock tRPC] Getting download URL for document ${documentId}`);
          return { downloadUrl: `https://example.com/download/${documentId}` };
        },
        mutate: ({ documentId }: { documentId: string }) => {
          console.log(`[Mock tRPC] Getting download URL for document ${documentId}`);
          return { downloadUrl: `https://example.com/download/${documentId}` };
        }
      };
    }
    
    if (procedure === 'incrementViewCount') {
      return {
        ...commonProps,
        mutateAsync: async ({ documentId }: { documentId: string }) => {
          console.log(`[Mock tRPC] Incrementing view count for document ${documentId}`);
          return { success: true };
        },
        mutate: ({ documentId }: { documentId: string }) => {
          console.log(`[Mock tRPC] Incrementing view count for document ${documentId}`);
          return { success: true };
        }
      };
    }
    
    if (procedure === 'createDocument') {
      return {
        ...commonProps,
        mutateAsync: async (docData: any) => {
          console.log(`[Mock tRPC] Creating document with data:`, docData);
          return {
            id: 'new-doc-id',
            ...docData,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        },
        mutate: (docData: any) => {
          console.log(`[Mock tRPC] Creating document with data:`, docData);
        }
      };
    }
    
    if (procedure === 'getUploadUrl') {
      return {
        ...commonProps,
        mutateAsync: async (fileData: any) => {
          console.log(`[Mock tRPC] Getting upload URL for file:`, fileData);
          return {
            uploadUrl: `https://example.com/upload/${fileData.fileName}`,
            filePath: `documents/${fileData.category.toLowerCase()}/${fileData.fileName}`
          };
        },
        mutate: (fileData: any) => {
          console.log(`[Mock tRPC] Getting upload URL for file:`, fileData);
        }
      };
    }
    
    if (procedure === 'deleteDocument') {
      return {
        ...commonProps,
        mutateAsync: async ({ documentId }: { documentId: string }) => {
          console.log(`[Mock tRPC] Deleting document ${documentId}`);
          return { success: true };
        },
        mutate: ({ documentId }: { documentId: string }) => {
          console.log(`[Mock tRPC] Deleting document ${documentId}`);
        }
      };
    }
  }
  
  // Handle translations router
  if (router === 'translations') {
    if (procedure === 'requestTranslation') {
      return {
        ...commonProps,
        mutateAsync: async ({ documentId, targetLanguage }: { documentId: string, targetLanguage: Language }) => {
          console.log(`[Mock tRPC] Requesting translation for document ${documentId} to ${targetLanguage}`);
          return { success: true, jobId: 'mock-job-id' };
        },
        mutate: ({ documentId, targetLanguage }: { documentId: string, targetLanguage: Language }) => {
          console.log(`[Mock tRPC] Requesting translation for document ${documentId} to ${targetLanguage}`);
        }
      };
    }
  }
  
  // Default fallback for unhandled mutations
  return {
    ...commonProps,
    mutateAsync: async (data: any) => {
      console.log(`[Mock tRPC] Unhandled mutation ${router}.${procedure} with data:`, data);
      return { success: true };
    },
    mutate: (data: any) => {
      console.log(`[Mock tRPC] Unhandled mutation ${router}.${procedure} with data:`, data);
    }
  };
};

// Mock handler for useInfiniteQuery
const mockInfiniteQueryHandler = (router: string, procedure: string, params: any) => {
  console.log(`[Mock tRPC] useInfiniteQuery called for ${router}.${procedure} with params:`, params);
  
  // Default implementation for all infinite queries
  return {
    data: {
      pages: [mockDocuments.slice(0, 3)],
      pageParams: [null]
    },
    isLoading: false,
    isError: false,
    error: null,
    fetchNextPage: () => Promise.resolve(),
    fetchPreviousPage: () => Promise.resolve(),
    hasNextPage: false,
    hasPreviousPage: false,
    isFetchingNextPage: false,
    isFetchingPreviousPage: false,
    status: 'success',
    refetch: () => Promise.resolve()
  };
};

/**
 * Enhanced TRPCProvider that creates a proper client with all required methods
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
  const [trpcClient] = React.useState(() => 
    api.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
          // Empty headers to avoid fetch errors in Storybook
          headers: () => ({}),
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <TRPCMockContext.Provider value={createTRPCProxy()}>
          {children}
        </TRPCMockContext.Provider>
      </api.Provider>
    </QueryClientProvider>
  );
}

/**
 * Context for tRPC mocking in Storybook
 */
export const TRPCMockContext = React.createContext<ReturnType<typeof createTRPCProxy> | null>(null);

/**
 * Hook to access tRPC mock functions - use this to override the default tRPC client in stories
 * This provides a complete mock API that matches the actual tRPC API shape
 */
export function useTRPCMock() {
  const context = React.useContext(TRPCMockContext);
  if (context === null) {
    throw new Error('useTRPCMock must be used within a TRPCProvider');
  }
  return context;
}

/**
 * Re-export api to make it easy to access in stories
 */
export { api }; 