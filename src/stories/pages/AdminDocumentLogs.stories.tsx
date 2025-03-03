import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { I18nProvider } from '@/lib/i18n/client';
import { FileText, ArrowLeft, Clock, Filter, ChevronDown, User, Search, Plus, RefreshCw, X } from 'lucide-react';

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

// Helper function to format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Action type color mapping
const actionTypeColor = (action: string) => {
  switch (action) {
    case 'create':
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case 'update':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    case 'delete':
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    case 'view':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    case 'download':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
    case 'translate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  }
};

// Action icon mapping
const getActionIcon = (action: string) => {
  switch (action) {
    case 'create':
      return <Plus className="h-4 w-4" />;
    case 'update':
      return <FileText className="h-4 w-4" />;
    case 'delete':
      return <X className="h-4 w-4" />;
    case 'view':
      return <Eye className="h-4 w-4" />;
    case 'download':
      return <Download className="h-4 w-4" />;
    case 'translate':
      return <Languages className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Create a custom Eye icon component since it's not imported
const Eye = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// Create a custom Download icon component
const Download = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

// Create a custom Languages icon component
const Languages = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8l6 6"></path>
    <path d="M4 14l6-6 2-3"></path>
    <path d="M2 5h12"></path>
    <path d="M7 2h1"></path>
    <path d="M22 22l-5-10-5 10"></path>
    <path d="M14 18h6"></path>
  </svg>
);

// Type for our mock props
interface MockDocumentLogsPageProps {
  isLoading?: boolean;
  isEmptyState?: boolean;
  filterAction?: string;
}

// Mock component wrapper that doesn't depend on the actual page component
const MockDocumentLogsPage: React.FC<MockDocumentLogsPageProps> = ({ 
  isLoading = false, 
  isEmptyState = false,
  filterAction = '',
}) => {
  const logs = isEmptyState ? [] : filterAction 
    ? mockAuditLogsData.logs.filter(log => log.action === filterAction) 
    : mockAuditLogsData.logs;

  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedAction, setSelectedAction] = React.useState<string>("");

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <a 
              href="/admin/documents" 
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Document Activity Logs
            </h1>
          </div>

          {/* Search and filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <form className="flex w-full md:w-1/2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search logs by document title or user..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
              </form>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <button
                  className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Action Type
                  </label>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="view">View</option>
                    <option value="download">Download</option>
                    <option value="translate">Translate</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Audit logs table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mr-2" />
              <span>Loading...</span>
            </div>
          ) : logs.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Document
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.map((log) => {
                      const details = log.details as any;
                      return (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              {formatDate(log.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{log.user.name || log.user.email || 'Unknown user'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionTypeColor(log.action)}`}>
                              {getActionIcon(log.action)}
                              <span className="ml-1">{log.action}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-gray-400" />
                              <a 
                                href={`/admin/documents/${log.entityId}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {details?.title || `Document ID: ${log.entityId}`}
                              </a>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {log.action === 'update' && details?.changes ? (
                              <div>
                                Updated fields: 
                                {Object.keys(details.changes).map(field => (
                                  <span key={field} className="ml-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs">
                                    {field}
                                  </span>
                                ))}
                              </div>
                            ) : log.action === 'translate' && details?.fromLanguage && details?.toLanguage ? (
                              <div>
                                Translated from <span className="font-medium">{details.fromLanguage}</span> to <span className="font-medium">{details.toLanguage}</span>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No logs found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                There are no document activity logs matching your criteria.
              </p>
            </div>
          )}
        </div>
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
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    isEmptyState: {
      control: 'boolean',
      description: 'Show empty state with no logs',
    },
    filterAction: {
      control: 'select',
      options: ['', 'create', 'update', 'delete', 'view', 'download', 'translate'],
      description: 'Filter logs by action type',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MockDocumentLogsPage>;

export const Default: Story = {
  args: {
    isLoading: false,
    isEmptyState: false,
    filterAction: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default view of the document audit logs page showing all types of document actions.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    isEmptyState: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state of the document audit logs page.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    isLoading: false,
    isEmptyState: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state of the document audit logs page when no logs are available.',
      },
    },
  },
};

export const FilteredByCreateAction: Story = {
  args: {
    isLoading: false,
    isEmptyState: false,
    filterAction: 'create',
  },
  parameters: {
    docs: {
      description: {
        story: 'Document audit logs filtered to show only document creation actions.',
      },
    },
  },
}; 