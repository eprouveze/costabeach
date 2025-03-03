import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentLogsPage from '../page';
import { api } from '@/lib/trpc/react';
import { formatDate } from '@/lib/utils/shared';

// Mock dependencies
jest.mock('@/lib/trpc/react', () => ({
  api: {
    documents: {
      getDocumentAuditLogs: {
        useQuery: jest.fn(),
      },
    },
  },
}));

jest.mock('@/lib/i18n/client', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/lib/hooks/useRTL', () => ({
  useRTL: () => false,
}));

jest.mock('@/lib/utils/shared', () => ({
  formatDate: jest.fn().mockReturnValue('2023-01-01 12:00'),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('DocumentLogsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock audit log data
    const mockAuditLogs = {
      logs: [
        {
          id: 'log-1',
          action: 'create',
          entityType: 'Document',
          entityId: 'doc-1',
          userId: 'user-1',
          details: { title: 'Test Document 1' },
          createdAt: '2023-01-01T12:00:00Z',
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        {
          id: 'log-2',
          action: 'update',
          entityType: 'Document',
          entityId: 'doc-1',
          userId: 'user-1',
          details: { title: 'Test Document 1', fieldUpdated: 'title' },
          createdAt: '2023-01-02T12:00:00Z',
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        {
          id: 'log-3',
          action: 'view',
          entityType: 'Document',
          entityId: 'doc-2',
          userId: 'user-2',
          details: { title: 'Test Document 2' },
          createdAt: '2023-01-03T12:00:00Z',
          user: {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        },
      ],
      total: 3,
    };

    // Default mock implementation
    (api.documents.getDocumentAuditLogs.useQuery as jest.Mock).mockReturnValue({
      data: mockAuditLogs,
      isLoading: false,
      refetch: jest.fn(),
      isRefetching: false,
    });
  });

  test('renders audit logs table with correct data', async () => {
    render(<DocumentLogsPage />);

    // Check page title
    expect(screen.getByText('admin.documentActivityLogs')).toBeInTheDocument();

    // Check for table headers
    expect(screen.getByText('admin.timestamp')).toBeInTheDocument();
    expect(screen.getByText('admin.user')).toBeInTheDocument();
    expect(screen.getByText('admin.action')).toBeInTheDocument();
    expect(screen.getByText('admin.document')).toBeInTheDocument();
    expect(screen.getByText('admin.details')).toBeInTheDocument();

    // Check log entries are displayed
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Test Document 2')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('filters logs based on search query', async () => {
    render(<DocumentLogsPage />);

    // Enter search query for "Test Document 1"
    const searchInput = screen.getByPlaceholderText('admin.searchLogsPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Test Document 1' } });

    // Check that only matching logs are displayed
    expect(screen.getAllByText('Test Document 1').length).toBeGreaterThan(0);
    expect(screen.queryByText('Test Document 2')).not.toBeInTheDocument();
  });

  test('filters logs based on action type', async () => {
    render(<DocumentLogsPage />);

    // Open filters
    const filtersButton = screen.getByText('common.filters');
    fireEvent.click(filtersButton);

    // Select "create" action from dropdown
    const actionSelect = screen.getByLabelText('admin.actionType');
    fireEvent.change(actionSelect, { target: { value: 'create' } });

    // Verify that only create actions are displayed
    expect(screen.getAllByText(/admin.actions.create/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/admin.actions.update/i)).not.toBeInTheDocument();
  });

  test('displays loading state while fetching logs', async () => {
    // Mock loading state
    (api.documents.getDocumentAuditLogs.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
      isRefetching: false,
    });

    render(<DocumentLogsPage />);

    // Check loading indicator
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  test('refreshes logs when refresh button is clicked', async () => {
    const refetchMock = jest.fn();
    (api.documents.getDocumentAuditLogs.useQuery as jest.Mock).mockReturnValue({
      data: { logs: [], total: 0 },
      isLoading: false,
      refetch: refetchMock,
      isRefetching: false,
    });

    render(<DocumentLogsPage />);

    // Click refresh button
    const refreshButtons = screen.getAllByRole('button');
    const refreshButton = refreshButtons.find(button => 
      button.innerHTML.includes('RefreshCw')
    );
    
    if (refreshButton) {
      fireEvent.click(refreshButton);
    }

    // Verify refetch was called
    expect(refetchMock).toHaveBeenCalled();
  });

  test('renders empty state when no logs exist', async () => {
    // Mock empty logs
    (api.documents.getDocumentAuditLogs.useQuery as jest.Mock).mockReturnValue({
      data: { logs: [], total: 0 },
      isLoading: false,
      refetch: jest.fn(),
      isRefetching: false,
    });

    render(<DocumentLogsPage />);

    // Check empty state message
    expect(screen.getByText('admin.noLogsFound')).toBeInTheDocument();
  });
}); 