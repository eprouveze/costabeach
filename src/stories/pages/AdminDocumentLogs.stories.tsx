import type { Meta, StoryObj } from '@storybook/react';
import DocumentLogsPage from '@/app/admin/documents/logs/page';
import { api } from '@/lib/trpc/react';
import React from 'react';
import { I18nProvider } from '@/lib/i18n/client';

// Mock the API
const mockApi = {
  documents: {
    getDocumentAuditLogs: {
      useQuery: () => ({
        data: mockAuditLogsData,
        isLoading: false,
        refetch: () => {},
        isRefetching: false,
      }),
    },
  },
};

// Mock API for Storybook
jest.mock('@/lib/trpc/react', () => ({
  api: mockApi,
}));

// Mock formatting function
jest.mock('@/lib/utils/shared', () => ({
  formatDate: (date: Date) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
}));

// Sample audit log data
const mockAuditLogsData = {
  logs: [
    {
      id: 'log-1',
      action: 'create',
      entityType: 'Document',
      entityId: 'doc-1',
      userId: 'user-1',
      details: { title: 'Annual Financial Report 2023' },
      createdAt: '2023-01-01T10:00:00Z',
      user: {
        id: 'user-1',
        name: 'John Admin',
        email: 'john@example.com',
      },
    },
    {
      id: 'log-2',
      action: 'update',
      entityType: 'Document',
      entityId: 'doc-1',
      userId: 'user-1',
      details: { 
        title: 'Annual Financial Report 2023', 
        changes: { 
          title: { from: 'Financial Report 2023', to: 'Annual Financial Report 2023' },
          category: { from: 'GENERAL', to: 'FINANCE' }
        }
      },
      createdAt: '2023-01-02T11:30:00Z',
      user: {
        id: 'user-1',
        name: 'John Admin',
        email: 'john@example.com',
      },
    },
    {
      id: 'log-3',
      action: 'view',
      entityType: 'Document',
      entityId: 'doc-1',
      userId: 'user-2',
      details: { title: 'Annual Financial Report 2023' },
      createdAt: '2023-01-03T14:45:00Z',
      user: {
        id: 'user-2',
        name: 'Marie Owner',
        email: 'marie@example.com',
      },
    },
    {
      id: 'log-4',
      action: 'download',
      entityType: 'Document',
      entityId: 'doc-1',
      userId: 'user-2',
      details: { title: 'Annual Financial Report 2023' },
      createdAt: '2023-01-03T14:50:00Z',
      user: {
        id: 'user-2',
        name: 'Marie Owner',
        email: 'marie@example.com',
      },
    },
    {
      id: 'log-5',
      action: 'create',
      entityType: 'Document',
      entityId: 'doc-2',
      userId: 'user-3',
      details: { title: 'Maintenance Schedule 2023' },
      createdAt: '2023-01-04T09:15:00Z',
      user: {
        id: 'user-3',
        name: 'Ahmed Editor',
        email: 'ahmed@example.com',
      },
    },
    {
      id: 'log-6',
      action: 'delete',
      entityType: 'Document',
      entityId: 'doc-3',
      userId: 'user-1',
      details: { title: 'Outdated Document' },
      createdAt: '2023-01-05T16:20:00Z',
      user: {
        id: 'user-1',
        name: 'John Admin',
        email: 'john@example.com',
      },
    },
    {
      id: 'log-7',
      action: 'translate',
      entityType: 'Document',
      entityId: 'doc-2',
      userId: 'user-3',
      details: { 
        title: 'Maintenance Schedule 2023',
        fromLanguage: 'EN',
        toLanguage: 'FR'
      },
      createdAt: '2023-01-06T10:30:00Z',
      user: {
        id: 'user-3',
        name: 'Ahmed Editor',
        email: 'ahmed@example.com',
      },
    },
  ],
  total: 7,
};

// Mock component wrapper with i18n provider
const MockDocumentLogsPage: React.FC = () => {
  return (
    <I18nProvider locale="en">
      <div className="min-h-screen bg-gray-50">
        <DocumentLogsPage />
      </div>
    </I18nProvider>
  );
};

const meta: Meta<typeof MockDocumentLogsPage> = {
  title: 'pages/AdminDocumentLogs',
  component: MockDocumentLogsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Admin interface for viewing audit logs of document-related actions. Shows a comprehensive history of all document operations for monitoring and accountability.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MockDocumentLogsPage>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default view of the document audit logs page showing all types of document actions.',
      },
    },
  },
};

// Create a version with loading state
export const Loading: Story = {
  decorators: [
    (Story) => {
      // Override the mock to show loading state
      mockApi.documents.getDocumentAuditLogs.useQuery = () => ({
        data: undefined,
        isLoading: true,
        refetch: () => {},
        isRefetching: false,
      });
      
      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Loading state of the document audit logs page.',
      },
    },
  },
};

// Create a version with no logs
export const EmptyState: Story = {
  decorators: [
    (Story) => {
      // Override the mock to show empty state
      mockApi.documents.getDocumentAuditLogs.useQuery = () => ({
        data: { logs: [], total: 0 },
        isLoading: false,
        refetch: () => {},
        isRefetching: false,
      });
      
      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Empty state of the document audit logs page when no logs are available.',
      },
    },
  },
};

// Create a filtered view (only create actions)
export const FilteredByCreateAction: Story = {
  decorators: [
    (Story) => {
      // Override the mock to show only create actions
      mockApi.documents.getDocumentAuditLogs.useQuery = () => ({
        data: {
          logs: mockAuditLogsData.logs.filter(log => log.action === 'create'),
          total: mockAuditLogsData.logs.filter(log => log.action === 'create').length,
        },
        isLoading: false,
        refetch: () => {},
        isRefetching: false,
      });
      
      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: 'Document audit logs filtered to show only document creation actions.',
      },
    },
  },
}; 