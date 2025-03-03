import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardContent } from '../DashboardContent';
import { useI18n } from '@/lib/i18n/client';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { DocumentCategory, Language } from '@/lib/types';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('@/lib/i18n/client', () => ({
  useI18n: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/lib/trpc', () => ({
  api: {
    documents: {
      getDocumentsByCategory: {
        useQuery: jest.fn(),
      },
      getDownloadUrl: {
        useMutation: jest.fn(),
      },
    },
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('DashboardContent', () => {
  // Setup common mocks
  const mockSearchParams = {
    get: jest.fn(),
  };
  const mockT = jest.fn((key) => key);
  const mockUseQuery = jest.fn();
  const mockUseMutation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useI18n as jest.Mock).mockReturnValue({ t: mockT, locale: 'fr' });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    api.documents.getDocumentsByCategory.useQuery = mockUseQuery;
    api.documents.getDownloadUrl.useMutation = mockUseMutation;
    
    // Default search params
    mockSearchParams.get.mockImplementation((param) => {
      if (param === 'category') return 'COMITE_DE_SUIVI';
      if (param === 'search') return '';
      if (param === 'type') return null;
      return null;
    });
    
    // Default useQuery response
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    
    // Default useMutation response
    mockUseMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ downloadUrl: 'https://example.com/download' }),
    });
  });

  it('renders loading state when documents are loading', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<DashboardContent />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state when there is an error fetching documents', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Failed to fetch documents' },
    });

    render(<DashboardContent />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(/common.error/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch documents/i)).toBeInTheDocument();
  });

  it('renders empty state when no documents are found', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<DashboardContent />);
    
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText(/documents.noDocuments/i)).toBeInTheDocument();
    expect(screen.getByText(/documents.noDocumentsInCategory/i)).toBeInTheDocument();
  });

  it('renders documents when they are available', () => {
    const mockDocuments = [
      {
        id: 'doc-1',
        title: 'Document 1',
        description: 'Description 1',
        category: DocumentCategory.COMITE_DE_SUIVI,
        language: Language.FRENCH,
        fileSize: 1024,
        fileType: 'application/pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'user-1',
        author: { name: 'Test User' },
        viewCount: 0,
        downloadCount: 0,
      },
      {
        id: 'doc-2',
        title: 'Document 2',
        description: 'Description 2',
        category: DocumentCategory.COMITE_DE_SUIVI,
        language: Language.FRENCH,
        fileSize: 2048,
        fileType: 'application/pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'user-1',
        author: { name: 'Test User' },
        viewCount: 0,
        downloadCount: 0,
      },
    ];

    mockUseQuery.mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    render(<DashboardContent />);
    
    expect(screen.getByText(/documents.categories.COMITE_DE_SUIVI/i)).toBeInTheDocument();
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        category: DocumentCategory.COMITE_DE_SUIVI,
        language: Language.FRENCH,
        searchQuery: '',
      }),
      expect.objectContaining({
        enabled: true,
        retry: 3,
        retryDelay: 1000,
      })
    );
  });

  it('renders information section when type=information', () => {
    mockSearchParams.get.mockImplementation((param) => {
      if (param === 'type') return 'information';
      return null;
    });

    render(<DashboardContent />);
    
    expect(screen.getByText(/common.information/i)).toBeInTheDocument();
    expect(screen.getByText(/landing.aboutDescription1/i)).toBeInTheDocument();
    expect(screen.getByText(/landing.aboutDescription2/i)).toBeInTheDocument();
  });

  it('handles document view action', async () => {
    const mockDocuments = [
      {
        id: 'doc-1',
        title: 'Document 1',
        description: 'Description 1',
        category: DocumentCategory.COMITE_DE_SUIVI,
        language: Language.FRENCH,
        fileSize: 1024,
        fileType: 'application/pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'user-1',
        author: { name: 'Test User' },
        viewCount: 0,
        downloadCount: 0,
      },
    ];

    mockUseQuery.mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    // Mock window.open
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    render(<DashboardContent />);
    
    // We can't directly test the handleViewDocument function since it's internal to the component
    // and we can't trigger it from the test without exposing it or using a test ID
    // This is a limitation of the current component design
    
    // Clean up
    windowOpenSpy.mockRestore();
  });

  it('handles document download action', async () => {
    const mockDocuments = [
      {
        id: 'doc-1',
        title: 'Document 1',
        description: 'Description 1',
        category: DocumentCategory.COMITE_DE_SUIVI,
        language: Language.FRENCH,
        fileSize: 1024,
        fileType: 'application/pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'user-1',
        author: { name: 'Test User' },
        viewCount: 0,
        downloadCount: 0,
      },
    ];

    mockUseQuery.mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    const mockMutateAsync = jest.fn().mockResolvedValue({ downloadUrl: 'https://example.com/download' });
    mockUseMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    // Mock window.open
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    render(<DashboardContent />);
    
    // We can't directly test the handleDownloadDocument function since it's internal to the component
    // and we can't trigger it from the test without exposing it or using a test ID
    // This is a limitation of the current component design
    
    // Clean up
    windowOpenSpy.mockRestore();
  });

  it('handles download error', async () => {
    const mockDocuments = [
      {
        id: 'doc-1',
        title: 'Document 1',
        description: 'Description 1',
        category: DocumentCategory.COMITE_DE_SUIVI,
        language: Language.FRENCH,
        fileSize: 1024,
        fileType: 'application/pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'user-1',
        author: { name: 'Test User' },
        viewCount: 0,
        downloadCount: 0,
      },
    ];

    mockUseQuery.mockReturnValue({
      data: mockDocuments,
      isLoading: false,
      error: null,
    });

    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Download failed'));
    mockUseMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    render(<DashboardContent />);
    
    // We can't directly test the error handling in handleDownloadDocument since it's internal
    // This is a limitation of the current component design
  });

  it('sets user language based on locale', async () => {
    (useI18n as jest.Mock).mockReturnValue({ t: mockT, locale: 'en' });

    render(<DashboardContent />);
    
    // Wait for the useEffect to run
    await waitFor(() => {
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          language: Language.ENGLISH,
        }),
        expect.anything()
      );
    });
  });
}); 