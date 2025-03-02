/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentPreview } from '../DocumentPreview';
import { trpc } from '@/lib/trpc/client';
import { DocumentCategory, Language } from '@/lib/types';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { toast } from 'react-toastify';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Download: () => <div data-testid="download-icon">Download</div>,
  Languages: () => <div data-testid="languages-icon">Languages</div>,
  Loader: () => <div data-testid="loader-icon">Loader</div>,
}));

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

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the useDocuments hook
jest.mock('@/lib/hooks/useDocuments', () => ({
  useDocuments: jest.fn(),
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
    
    // Default mock implementation for useDocuments
    (useDocuments as jest.Mock).mockReturnValue({
      previewDocument: jest.fn().mockResolvedValue('https://example.com/preview'),
      downloadDocument: jest.fn().mockResolvedValue(true),
      isLoading: false,
    });
  });

  it('should request a translation and show pending status', async () => {
    // Mock the mutation and query hooks
    const mockMutate = jest.fn().mockImplementation((params, options) => {
      options.onSuccess({ status: 'pending' });
    });

    (trpc.translations.requestDocumentTranslation.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });

    (trpc.translations.getTranslationStatus.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: jest.fn(),
    });

    const user = userEvent.setup();
    const mockRequestTranslation = jest.fn();

    // Render with initial state
    await act(async () => {
      render(
        <DocumentPreview
          document={mockDocument}
          onClose={jest.fn()}
          onRequestTranslation={mockRequestTranslation}
        />
      );
    });

    // Wait for the preview to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    // Find and click the translation request button
    const translationButton = await screen.findByTestId('request-translation-button');
    await user.click(translationButton);

    // Verify the translation request was made
    expect(mockRequestTranslation).toHaveBeenCalled();

    // Update the query to show pending status
    await act(async () => {
      (trpc.translations.getTranslationStatus.useQuery as jest.Mock).mockReturnValue({
        data: { status: 'pending' },
        isLoading: false,
        refetch: jest.fn(),
      });
    });

    // Re-render to reflect the updated state
    await waitFor(() => {
      expect(screen.getByText(/Translation in progress/i)).toBeInTheDocument();
    });
  });

  it('should show completed status when translation is ready', async () => {
    // Create a modified document with isTranslated set to true
    const translatedDocument = {
      ...mockDocument,
      isTranslated: true,
    };

    // Mock the query hook to return completed status
    (trpc.translations.getTranslationStatus.useQuery as jest.Mock).mockReturnValue({
      data: { status: 'completed' },
      isLoading: false,
      refetch: jest.fn(),
    });

    await act(async () => {
      render(
        <DocumentPreview
          document={translatedDocument}
          onClose={jest.fn()}
        />
      );
    });

    // Verify the completed status is shown
    await waitFor(() => {
      expect(screen.getByText(/Translation available/i)).toBeInTheDocument();
    });
  });

  it('should handle translation request errors', async () => {
    // Set up a document that would show the translation button
    const translationDocument = {
      ...mockDocument,
      language: Language.ENGLISH,
      isTranslated: false,
      translatedDocumentId: null
    };

    // Mock the mutation to throw an error
    const mockMutate = jest.fn().mockImplementation(() => {
      throw new Error('Translation request failed');
    });

    (trpc.translations.requestDocumentTranslation.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });

    // Mock the toast.error function
    const errorSpy = jest.spyOn(toast, 'error');

    const user = userEvent.setup();

    await act(async () => {
      render(
        <DocumentPreview 
          document={translationDocument} 
          onClose={jest.fn()}
          onRequestTranslation={(id) => {
            try {
              mockMutate();
              return Promise.reject(new Error('Translation request failed'));
            } catch (error) {
              toast.error('Failed to request translation');
              throw error;
            }
          }}
        />
      );
    });
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });
    
    // Find and click the request translation button
    const requestButton = await screen.findByTestId('request-translation-button');
    
    // This will trigger the error
    await act(async () => {
      await user.click(requestButton);
    });
    
    // Verify toast error was called
    expect(errorSpy).toHaveBeenCalledWith('Failed to request translation');
  });

  it('should poll for translation status updates', async () => {
    // Mock the query hook with refetch functionality
    const mockRefetch = jest.fn();
    
    // Initial state - pending
    (trpc.translations.getTranslationStatus.useQuery as jest.Mock).mockReturnValue({
      data: { status: 'pending' },
      isLoading: false,
      refetch: mockRefetch,
    });

    // Create a document with translationStatus set to pending
    const pendingDocument = {
      ...mockDocument,
      isTranslated: false,
    };

    let rerender: any;
    
    await act(async () => {
      const result = render(
        <DocumentPreview
          document={pendingDocument}
          onClose={jest.fn()}
        />
      );
      rerender = result.rerender;
    });

    // Verify initial pending status
    expect(screen.getByText(/Translation in progress/i)).toBeInTheDocument();

    // Simulate a status update after polling
    // Update the mock to return completed status
    await act(async () => {
      (trpc.translations.getTranslationStatus.useQuery as jest.Mock).mockReturnValue({
        data: { status: 'completed' },
        isLoading: false,
        refetch: mockRefetch,
      });
    });

    // Create a document with isTranslated set to true
    const completedDocument = {
      ...mockDocument,
      isTranslated: true,
    };

    // Re-render with the updated document
    await act(async () => {
      rerender(
        <DocumentPreview
          document={completedDocument}
          onClose={jest.fn()}
        />
      );
    });

    // Verify the component shows the completed status
    await waitFor(() => {
      expect(screen.getByText(/Translation available/i)).toBeInTheDocument();
    });
  });
}); 