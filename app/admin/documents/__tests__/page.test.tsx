import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDocumentsPage from '../page';
import { api } from '@/lib/trpc/react';
import { useSession } from 'next-auth/react';
import { checkPermission } from '@/lib/utils/permissions';
import { DocumentCategory, UserPermission } from '@/lib/types';

// Mock dependencies
jest.mock('@/lib/trpc/react', () => ({
  api: {
    documents: {
      getDocumentsByCategory: {
        useQuery: jest.fn(),
      },
      deleteDocument: {
        useMutation: jest.fn(),
      },
    },
  },
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/lib/i18n/client', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/lib/hooks/useRTL', () => ({
  useRTL: () => false,
}));

jest.mock('@/lib/utils/permissions', () => ({
  checkPermission: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('AdminDocumentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          permissions: [UserPermission.MANAGE_DOCUMENTS],
        }
      }
    });
    
    (checkPermission as jest.Mock).mockReturnValue(true);
    
    (api.documents.getDocumentsByCategory.useQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 'doc-1',
          title: 'Test Document 1',
          description: 'Description 1',
          category: DocumentCategory.GENERAL,
          language: 'EN',
          viewCount: 10,
          downloadCount: 5,
          fileSize: 1024,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: { name: 'John Doe' },
        },
        {
          id: 'doc-2',
          title: 'Test Document 2',
          description: 'Description 2',
          category: DocumentCategory.COMITE_REPORTS,
          language: 'FR',
          viewCount: 8,
          downloadCount: 3,
          fileSize: 512,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: { name: 'Jane Smith' },
        },
      ],
      isLoading: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
    
    (api.documents.deleteDocument.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
  });

  test('renders admin documents page with document list', async () => {
    render(<AdminDocumentsPage />);
    
    // Wait for component to load documents
    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      expect(screen.getByText('Test Document 2')).toBeInTheDocument();
    });
    
    // Check for document elements
    expect(screen.getByText('admin.documentManagement')).toBeInTheDocument();
    expect(screen.getByText('admin.documentActivityLogs')).toBeInTheDocument();
    expect(screen.getByText('documents.upload')).toBeInTheDocument();
  });

  test('filters documents based on user permissions', async () => {
    // Mock user without MANAGE_DOCUMENTS but with MANAGE_COMITE_DOCUMENTS
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          permissions: [UserPermission.MANAGE_COMITE_DOCUMENTS],
        }
      }
    });
    
    // Mock checkPermission to only allow COMITE_REPORTS
    (checkPermission as jest.Mock).mockImplementation((permissions, permission) => {
      return permission === UserPermission.MANAGE_COMITE_DOCUMENTS;
    });
    
    render(<AdminDocumentsPage />);
    
    // Wait for component to load and filter documents
    await waitFor(() => {
      // Should show COMITE_REPORTS document but not GENERAL
      expect(screen.queryByText('Test Document 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Document 2')).toBeInTheDocument();
    });
  });

  test('allows searching for documents', async () => {
    const refetchMock = jest.fn();
    (api.documents.getDocumentsByCategory.useQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 'doc-1',
          title: 'Test Document 1',
          description: 'Description 1',
          category: DocumentCategory.GENERAL,
          language: 'EN',
          viewCount: 10,
          downloadCount: 5,
          fileSize: 1024,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: { name: 'John Doe' },
        },
      ],
      isLoading: false,
      refetch: refetchMock,
      isRefetching: false,
    });
    
    render(<AdminDocumentsPage />);
    
    // Enter search query
    const searchInput = screen.getByPlaceholderText('admin.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Test Document 1' } });
    
    // Submit the search form
    const searchButton = screen.getByText('common.search');
    fireEvent.click(searchButton);
    
    // Verify refetch was called for the search
    expect(refetchMock).toHaveBeenCalled();
  });

  test('shows upload modal when upload button is clicked', async () => {
    render(<AdminDocumentsPage />);
    
    // Click upload button
    const uploadButton = screen.getByText('documents.upload');
    fireEvent.click(uploadButton);
    
    // Check if upload modal appears
    await waitFor(() => {
      expect(screen.getByText('documents.uploadNew')).toBeInTheDocument();
    });
  });

  test('shows delete confirmation when delete button is clicked', async () => {
    render(<AdminDocumentsPage />);
    
    // Wait for documents to load
    await waitFor(() => {
      expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    });
    
    // Find all delete buttons and click the first one
    const deleteButtons = screen.getAllByText('common.delete');
    fireEvent.click(deleteButtons[0]);
    
    // Check if confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('admin.confirmDelete')).toBeInTheDocument();
      expect(screen.getByText('documents.deleteWarning')).toBeInTheDocument();
    });
  });
}); 