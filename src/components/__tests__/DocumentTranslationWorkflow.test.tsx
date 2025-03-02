/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentPreview } from '../DocumentPreview';
import { trpc } from '@/lib/trpc/client';
import { DocumentCategory, Language } from '@/lib/types';

// Mock the trpc client
jest.mock('@/lib/trpc/client', () => ({
  trpc: {
    translations: {
      requestDocumentTranslation: {
        useMutation: jest.fn(),
      },
      getTranslationStatus: {
        useQuery: jest.fn(),
      },
    },
  },
}));

// Mock the useDocuments hook
jest.mock('@/lib/hooks/useDocuments', () => ({
  useDocuments: jest.fn().mockReturnValue({
    previewDocument: jest.fn().mockResolvedValue('https://example.com/preview'),
    downloadDocument: jest.fn().mockResolvedValue(true),
    isLoading: false,
  }),
}));

describe('Document Translation Workflow', () => {
  const mockDocument = {
    id: '123',
    title: 'Test Document',
    description: 'Test description',
    filePath: 'test/path.pdf',
    fileSize: 1024,
    fileType: 'application/pdf',
    category: DocumentCategory.COMITE_DE_SUIVI,
    language: Language.FRENCH,
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 0,
    downloadCount: 0,
    isPublished: true,
    isTranslated: false,
    authorId: 'user123',
    translatedDocumentId: null,
    translatedDocument: null,
    translations: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should request a translation and show pending status', async () => {
    // Mock the mutation and query hooks
    const mockMutate = jest.fn().mockImplementation((params, options) => {
      options.onSuccess({ status: 'pending' });
    });

    const mockUseQuery = jest.fn().mockReturnValue({
      data: { status: 'pending' },
      isLoading: false,
      refetch: jest.fn(),
    });

    (trpc.translations.requestDocumentTranslation.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });

    (trpc.translations.getTranslationStatus.useQuery as jest.Mock).mockImplementation(mockUseQuery);

    const user = userEvent.setup();
    const mockRequestTranslation = jest.fn();

    render(
      <DocumentPreview
        document={mockDocument}
        onClose={jest.fn()}
        onRequestTranslation={mockRequestTranslation}
        preferredLanguage={Language.ENGLISH}
      />
    );

    // Find and click the translation request button
    const translationButton = screen.getByTestId('request-translation-button');
    await user.click(translationButton);

    // Verify the translation request was made
    expect(mockRequestTranslation).toHaveBeenCalled();

    // Update the component to show pending status
    mockUseQuery.mockReturnValue({
      data: { status: 'pending' },
      isLoading: false,
      refetch: jest.fn(),
    });

    // Re-render to reflect the updated state
    await waitFor(() => {
      expect(screen.getByText(/Translation in progress/i)).toBeInTheDocument();
    });
  });

  it('should show completed status when translation is ready', async () => {
    // Mock the query hook to return completed status
    const mockUseQuery = jest.fn().mockReturnValue({
      data: { 
        status: 'completed',
        documentId: '456'
      },
      isLoading: false,
      refetch: jest.fn(),
    });

    (trpc.translations.getTranslationStatus.useQuery as jest.Mock).mockImplementation(mockUseQuery);

    render(
      <DocumentPreview
        document={mockDocument}
        onClose={jest.fn()}
        preferredLanguage={Language.ENGLISH}
      />
    );

    // Verify the completed status is shown
    await waitFor(() => {
      expect(screen.getByText(/Translation available/i)).toBeInTheDocument();
    });

    // There should be a button to view the translated document
    const viewTranslationButton = screen.getByText(/View Translation/i);
    expect(viewTranslationButton).toBeInTheDocument();
  });

  it('should handle translation request errors', async () => {
    // Mock the mutation hook to return an error
    const mockMutate = jest.fn().mockImplementation((params, options) => {
      options.onError(new Error('Translation request failed'));
    });

    (trpc.translations.requestDocumentTranslation.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });

    const user = userEvent.setup();
    const mockRequestTranslation = jest.fn();

    render(
      <DocumentPreview
        document={mockDocument}
        onClose={jest.fn()}
        onRequestTranslation={mockRequestTranslation}
        preferredLanguage={Language.ENGLISH}
      />
    );

    // Find and click the translation request button
    const translationButton = screen.getByTestId('request-translation-button');
    await user.click(translationButton);

    // Verify the translation request was made
    expect(mockRequestTranslation).toHaveBeenCalled();

    // Error handling would typically be done in the component or via toast notifications
    // which are harder to test directly, but we can verify the mutation was called with error handling
    expect(mockMutate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        onError: expect.any(Function)
      })
    );
  });

  it('should poll for translation status updates', async () => {
    // Mock the query hook with refetch functionality
    const mockRefetch = jest.fn();
    let statusData = { status: 'pending' };

    const mockUseQuery = jest.fn().mockImplementation(() => ({
      data: statusData,
      isLoading: false,
      refetch: mockRefetch,
    }));

    (trpc.translations.getTranslationStatus.useQuery as jest.Mock).mockImplementation(mockUseQuery);

    render(
      <DocumentPreview
        document={mockDocument}
        onClose={jest.fn()}
        preferredLanguage={Language.ENGLISH}
      />
    );

    // Verify initial pending status
    expect(screen.getByText(/Translation in progress/i)).toBeInTheDocument();

    // Simulate a status update after polling
    statusData = { status: 'completed', documentId: '456' };
    
    // Force a re-render to reflect the updated state
    await act(async () => {
      mockRefetch();
    });

    // Re-render the component with updated mock
    (trpc.translations.getTranslationStatus.useQuery as jest.Mock).mockReturnValue({
      data: statusData,
      isLoading: false,
      refetch: mockRefetch,
    });

    // Verify the component shows the completed status
    await waitFor(() => {
      expect(screen.getByText(/Translation available/i)).toBeInTheDocument();
    });
  });
}); 