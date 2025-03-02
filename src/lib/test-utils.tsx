import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from './trpc/client';
import { render } from '@testing-library/react';
import { observable } from '@trpc/server/observable';

// Create a wrapper with trpc provider for testing components that use trpc
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function createTestWrapper() {
  const queryClient = createTestQueryClient();
  
  // Create a mock trpc client
  const mockTrpc = trpc.createClient({
    links: [
      () => {
        return ({ op }) => {
          const data = {
            translations: {
              getTranslationStatus: {
                status: 'completed',
              },
            },
          };
          
          // Return mock data based on the procedure path
          // Use a type-safe approach to access nested properties
          let result: unknown = data;
          const pathParts = op.path.split('.');
          
          for (const part of pathParts) {
            if (result && typeof result === 'object' && part in result) {
              result = (result as Record<string, unknown>)[part];
            } else {
              result = undefined;
              break;
            }
          }
          
          // Return an observable that emits the mock result
          return observable((observer) => {
            observer.next({
              result: {
                data: result,
              },
            });
            observer.complete();
            
            return () => {
              // Cleanup function (if needed)
            };
          });
        };
      },
    ],
  });

  return ({ children }: { children: ReactNode }) => (
    <trpc.Provider client={mockTrpc} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

// Custom render with trpc provider
export function renderWithTRPC(ui: React.ReactElement) {
  const Wrapper = createTestWrapper();
  return render(ui, { wrapper: Wrapper });
} 