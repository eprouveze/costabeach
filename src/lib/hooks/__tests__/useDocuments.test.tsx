import { renderHook, act } from '@testing-library/react';
import { useDocuments } from '../useDocuments';
import { trpc } from '@/lib/trpc/react';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('@/lib/trpc/react', () => ({
  trpc: {
    documents: {
      list: {
        useQuery: jest.fn(),
      },
      search: {
        useQuery: jest.fn(),
      },
      download: {
        useMutation: jest.fn(),
      },
      preview: {
        useMutation: jest.fn(),
      },
      delete: {
        useMutation: jest.fn(),
      },
      update: {
        useMutation: jest.fn(),
      },
    },
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('useDocuments Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (trpc.documents.list.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });
    
    (trpc.documents.search.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });
    
    (trpc.documents.download.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ url: 'https://example.com/download' }),
      isLoading: false,
    });
    
    (trpc.documents.preview.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ url: 'https://example.com/preview' }),
      isLoading: false,
    });
    
    (trpc.documents.delete.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isLoading: false,
    });
    
    (trpc.documents.update.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({}),
      isLoading: false,
    });
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ url: 'https://example.com/api-preview' }),
    });
  });
  
  it('should fetch documents list', () => {
    const mockDocuments = [
      { id: '1', title: 'Document 1' },
      { id: '2', title: 'Document 2' },
    ];
    
    (trpc.documents.list.useQuery as jest.Mock).mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      refetch: jest.fn(),
    });
    
    const { result } = renderHook(() => useDocuments());
    
    expect(result.current.documents).toEqual(mockDocuments);
    expect(result.current.isLoading).toBe(false);
  });
  
  it('should search documents', () => {
    const mockSearchResults = [
      { id: '1', title: 'Search Result 1' },
      { id: '2', title: 'Search Result 2' },
    ];
    
    (trpc.documents.search.useQuery as jest.Mock).mockReturnValue({
      data: mockSearchResults,
      isLoading: false,
      refetch: jest.fn(),
    });
    
    const { result } = renderHook(() => useDocuments({ query: 'test' }));
    
    expect(result.current.documents).toEqual(mockSearchResults);
    expect(trpc.documents.search.useQuery).toHaveBeenCalledWith({ query: 'test' });
  });
  
  it('should download a document', async () => {
    const mockDownloadUrl = 'https://example.com/download';
    const mockMutateAsync = jest.fn().mockResolvedValue({ url: mockDownloadUrl });
    
    (trpc.documents.download.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    });
    
    // Mock window.open
    const originalOpen = window.open;
    window.open = jest.fn();
    
    const { result } = renderHook(() => useDocuments());
    
    await act(async () => {
      await result.current.downloadDocument('123', 'Test Document');
    });
    
    expect(mockMutateAsync).toHaveBeenCalledWith('123');
    expect(window.open).toHaveBeenCalledWith(mockDownloadUrl, '_blank');
    
    // Restore original window.open
    window.open = originalOpen;
  });
  
  it('should handle download errors', async () => {
    const mockError = new Error('Download failed');
    const mockMutateAsync = jest.fn().mockRejectedValue(mockError);
    
    (trpc.documents.download.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    });
    
    const { result } = renderHook(() => useDocuments());
    
    await act(async () => {
      await result.current.downloadDocument('123', 'Test Document');
    });
    
    expect(mockMutateAsync).toHaveBeenCalledWith('123');
    expect(toast.error).toHaveBeenCalledWith('Failed to download document: Download failed');
  });
  
  it('should preview a document using API', async () => {
    const mockPreviewUrl = 'https://example.com/api-preview';
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ url: mockPreviewUrl }),
    });
    
    const { result } = renderHook(() => useDocuments());
    
    let previewUrl;
    await act(async () => {
      previewUrl = await result.current.previewDocument('123');
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/documents/123/preview');
    expect(previewUrl).toBe(mockPreviewUrl);
  });
  
  it('should handle preview errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    
    const { result } = renderHook(() => useDocuments());
    
    let previewUrl;
    await act(async () => {
      previewUrl = await result.current.previewDocument('123');
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/documents/123/preview');
    expect(previewUrl).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('Failed to preview document: 404 Not Found');
  });
  
  it('should delete a document', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    const mockRefetch = jest.fn();
    
    (trpc.documents.delete.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    });
    
    (trpc.documents.list.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetch,
    });
    
    const { result } = renderHook(() => useDocuments());
    
    await act(async () => {
      await result.current.deleteDocument('123');
    });
    
    expect(mockMutateAsync).toHaveBeenCalledWith('123');
    expect(toast.success).toHaveBeenCalledWith('Document deleted successfully');
    expect(mockRefetch).toHaveBeenCalled();
  });
  
  it('should handle delete errors', async () => {
    const mockError = new Error('Delete failed');
    const mockMutateAsync = jest.fn().mockRejectedValue(mockError);
    
    (trpc.documents.delete.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    });
    
    const { result } = renderHook(() => useDocuments());
    
    await act(async () => {
      await result.current.deleteDocument('123');
    });
    
    expect(mockMutateAsync).toHaveBeenCalledWith('123');
    expect(toast.error).toHaveBeenCalledWith('Failed to delete document: Delete failed');
  });
}); 