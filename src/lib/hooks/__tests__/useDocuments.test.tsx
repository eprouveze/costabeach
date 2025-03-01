import { renderHook } from '@testing-library/react';
import { useDocuments } from '../useDocuments';
import { DocumentCategory, Language } from '@/lib/types';

// Mock the API client
jest.mock('@/lib/trpc/react', () => ({
  api: {
    useUtils: jest.fn(() => ({
      documents: {
        getDocumentsByCategory: {
          invalidate: jest.fn(),
        },
      },
    })),
    documents: {
      getDocumentsByCategory: {
        useQuery: jest.fn(() => ({
          data: [],
          isLoading: false,
          error: null,
        })),
      },
    },
  },
}));

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useDocuments Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the hook interface', () => {
    const { result } = renderHook(() => useDocuments());
    
    // Check that the hook returns the expected functions
    expect(result.current.useDocumentsByCategory).toBeDefined();
    expect(result.current.getDocuments).toBeDefined();
    expect(result.current.uploadDocument).toBeDefined();
    expect(result.current.downloadDocument).toBeDefined();
    expect(result.current.previewDocument).toBeDefined();
    expect(result.current.deleteDocument).toBeDefined();
    expect(result.current.isUploading).toBeDefined();
    expect(result.current.uploadProgress).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
  });
}); 