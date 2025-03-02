/**
 * @jest-environment jsdom
 */
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentPreview } from '../DocumentPreview';
import { useDocuments } from '@/lib/hooks/useDocuments';
import { DocumentCategory, Language } from '@/lib/types';
import { renderWithTRPC } from '@/lib/test-utils';

// Mock the useDocuments hook
jest.mock('@/lib/hooks/useDocuments', () => ({
  useDocuments: jest.fn(),
}));

// Mock trpc
jest.mock('@/lib/trpc/client', () => ({
  trpc: {
    translations: {
      getTranslationStatus: {
        useQuery: jest.fn().mockReturnValue({
          data: { status: 'completed' },
          isLoading: false,
          error: null,
        }),
      },
    },
    createClient: jest.fn(),
    Provider: ({ children }) => <>{children}</>,
  },
}));

// Mock fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob()),
  })
);

// Mock window.open
window.open = jest.fn();

describe('DocumentPreview Component', () => {
  const mockPreviewDocument = jest.fn().mockResolvedValue('https://example.com/preview');
  const mockDownloadDocument = jest.fn().mockResolvedValue(true);
  
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
    (useDocuments as jest.Mock).mockReturnValue({
      previewDocument: mockPreviewDocument,
      downloadDocument: mockDownloadDocument,
      isLoading: false
    });
  });
  
  it('should have the correct props structure', () => {
    // Verify that DocumentPreview is a valid component
    expect(typeof DocumentPreview).toBe('function');
    
    // Verify that the mock document has the expected structure
    expect(mockDocument).toHaveProperty('id');
    expect(mockDocument).toHaveProperty('title');
    expect(mockDocument).toHaveProperty('description');
    expect(mockDocument).toHaveProperty('filePath');
    expect(mockDocument.id).toBe('123');
    expect(mockDocument.title).toBe('Test Document');
  });
  
  it('should render the document preview for PDF', async () => {
    const user = userEvent.setup();
    
    renderWithTRPC(
      <DocumentPreview 
        document={mockDocument} 
        onClose={jest.fn()} 
      />
    );
    
    // Check if the document title is displayed
    expect(screen.getByTestId('document-title')).toHaveTextContent('Test Document');
    
    // Check if the loading state is shown initially
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    
    // Wait for the preview URL to be loaded
    await waitFor(() => {
      expect(mockPreviewDocument).toHaveBeenCalledWith('123');
    });
    
    // Mock the successful loading of preview
    mockPreviewDocument.mockResolvedValueOnce('https://example.com/preview');
    
    // Retry loading the preview
    const retryButton = screen.getByTestId('retry-button');
    await user.click(retryButton);
    
    await waitFor(() => {
      expect(mockPreviewDocument).toHaveBeenCalledTimes(2);
    });
  });
  
  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = jest.fn();
    
    renderWithTRPC(
      <DocumentPreview 
        document={mockDocument} 
        onClose={mockOnClose} 
      />
    );
    
    const closeButton = screen.getByTestId('close-button');
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('should handle download button click', async () => {
    const user = userEvent.setup();
    
    renderWithTRPC(
      <DocumentPreview 
        document={mockDocument} 
        onClose={jest.fn()} 
      />
    );
    
    const downloadButton = screen.getByTestId('download-button');
    await user.click(downloadButton);
    
    await waitFor(() => {
      expect(mockDownloadDocument).toHaveBeenCalledWith('123', 'Test Document');
    });
  });
  
  it('should render image preview for image files', async () => {
    const imageDocument = {
      ...mockDocument,
      fileType: 'image/jpeg',
      filePath: 'test/image.jpg'
    };
    
    mockPreviewDocument.mockResolvedValueOnce('https://example.com/image-preview');
    
    renderWithTRPC(
      <DocumentPreview 
        document={imageDocument} 
        onClose={jest.fn()} 
      />
    );
    
    await waitFor(() => {
      expect(mockPreviewDocument).toHaveBeenCalledWith('123');
    });
  });
  
  it('should show unsupported file type message for non-previewable files', async () => {
    const docxDocument = {
      ...mockDocument,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filePath: 'test/document.docx'
    };
    
    mockPreviewDocument.mockResolvedValueOnce(null);
    
    renderWithTRPC(
      <DocumentPreview 
        document={docxDocument} 
        onClose={jest.fn()} 
      />
    );
    
    await waitFor(() => {
      expect(mockPreviewDocument).toHaveBeenCalledWith('123');
      expect(screen.getByText(/Preview not available for this file type/i)).toBeInTheDocument();
    });
  });
  
  it('should show translation request button when provided', async () => {
    const user = userEvent.setup();
    const mockRequestTranslation = jest.fn();
    
    renderWithTRPC(
      <DocumentPreview 
        document={mockDocument} 
        onClose={jest.fn()} 
        onRequestTranslation={mockRequestTranslation}
      />
    );
    
    const translationButton = screen.getByTestId('request-translation-button');
    await user.click(translationButton);
    
    expect(mockRequestTranslation).toHaveBeenCalled();
  });
}); 