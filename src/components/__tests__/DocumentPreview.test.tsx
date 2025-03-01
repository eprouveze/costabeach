import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentPreview from '../DocumentPreview';
import { useDocuments } from '@/lib/hooks/useDocuments';

// Mock the useDocuments hook
jest.mock('@/lib/hooks/useDocuments', () => ({
  useDocuments: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ url: 'https://example.com/test.pdf' }),
  })
) as jest.Mock;

describe('DocumentPreview Component', () => {
  const mockDocument = {
    id: '1',
    title: 'Test Document',
    description: 'Test Description',
    fileType: 'application/pdf',
    filePath: 'documents/test.pdf',
    isPublished: true,
    viewCount: 0,
    downloadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDownloadDocument = jest.fn().mockResolvedValue('https://example.com/download/test.pdf');
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useDocuments as jest.Mock).mockReturnValue({
      downloadDocument: mockDownloadDocument,
    });
  });

  it('renders the document preview with title', async () => {
    render(
      <DocumentPreview 
        document={mockDocument} 
        onClose={jest.fn()} 
      />
    );

    expect(screen.getByText('Test Document')).toBeInTheDocument();
    
    // Wait for the preview to load
    await waitFor(() => {
      expect(screen.getByTestId('document-preview-iframe')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching preview URL', () => {
    // Mock fetch to delay response
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ url: 'https://example.com/test.pdf' }),
      }), 100))
    );

    render(
      <DocumentPreview 
        document={mockDocument} 
        onClose={jest.fn()} 
      />
    );

    expect(screen.getByText(/Loading preview/i)).toBeInTheDocument();
  });

  it('handles download button click', async () => {
    const user = userEvent.setup();
    
    render(
      <DocumentPreview 
        document={mockDocument} 
        onClose={jest.fn()} 
      />
    );

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);
    
    expect(mockDownloadDocument).toHaveBeenCalledWith(mockDocument.id);
  });

  it('handles close button click', async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();
    
    render(
      <DocumentPreview 
        document={mockDocument} 
        onClose={mockOnClose} 
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error message when preview fails to load', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })
    );

    render(
      <DocumentPreview 
        document={mockDocument} 
        onClose={jest.fn()} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load preview/i)).toBeInTheDocument();
    });
  });

  it('renders translation request button when provided', async () => {
    const mockOnRequestTranslation = jest.fn();
    
    render(
      <DocumentPreview 
        document={mockDocument} 
        onClose={jest.fn()}
        onRequestTranslation={mockOnRequestTranslation}
      />
    );

    const translationButton = screen.getByRole('button', { name: /request translation/i });
    expect(translationButton).toBeInTheDocument();
    
    const user = userEvent.setup();
    await user.click(translationButton);
    
    expect(mockOnRequestTranslation).toHaveBeenCalled();
  });
}); 