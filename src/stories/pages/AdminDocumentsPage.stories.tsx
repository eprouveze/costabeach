import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { I18nProvider } from '@/lib/i18n/client';
import { DocumentCategory, Language, Permission } from '@/lib/types';
import { 
  FileText, 
  Upload, 
  Filter, 
  Search, 
  ChevronDown, 
  History,
  Plus, 
  X, 
  Check, 
  RefreshCw,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';

// Generate mock documents data
const generateMockDocuments = (count: number) => {
  const categories = Object.values(DocumentCategory);
  const languages = Object.values(Language);
  
  return Array.from({ length: count }).map((_, index) => ({
    id: `doc-${index + 1}`,
    title: `Test Document ${index + 1}`,
    description: `Description for document ${index + 1}`,
    category: categories[index % categories.length],
    language: languages[index % languages.length],
    fileSize: 1024 * (index + 1),
    fileType: 'application/pdf',
    filePath: `/path/to/document-${index + 1}.pdf`,
    viewCount: Math.floor(Math.random() * 50),
    downloadCount: Math.floor(Math.random() * 20),
    createdAt: new Date(Date.now() - (index * 86400000)), // days ago
    updatedAt: new Date(Date.now() - (index * 43200000)), // half days ago
    authorId: 'user-1',
    author: { id: 'user-1', name: 'Admin User' },
    isPublished: true,
  }));
};

// Create mock documents
const mockDocuments = generateMockDocuments(12);

// Interface for the mock component props
interface MockAdminDocumentsPageProps {
  userPermissions: Permission[];
  isLoading?: boolean;
  noDocuments?: boolean;
  isAdmin?: boolean;
}

// Mock component implementation without depending on actual components
const MockAdminDocumentsPage: React.FC<MockAdminDocumentsPageProps> = ({ 
  userPermissions = [Permission.MANAGE_DOCUMENTS], 
  isLoading = false,
  noDocuments = false,
  isAdmin = true
}) => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<DocumentCategory | "">("");
  const [selectedLanguage, setSelectedLanguage] = React.useState<Language | "">("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);
  
  // Filter documents based on permissions
  const filteredDocuments = !noDocuments ? mockDocuments.filter(doc => {
    if (isAdmin) return true;
    
    // Create a mapping of document categories to required permissions
    const permissionMap: Record<DocumentCategory, Permission> = {
      [DocumentCategory.COMITE_DE_SUIVI]: Permission.MANAGE_COMITE_DOCUMENTS,
      [DocumentCategory.LEGAL]: Permission.MANAGE_LEGAL_DOCUMENTS,
      [DocumentCategory.SOCIETE_DE_GESTION]: Permission.MANAGE_SOCIETE_DOCUMENTS,
      [DocumentCategory.GENERAL]: Permission.MANAGE_DOCUMENTS,
      [DocumentCategory.FINANCE]: Permission.MANAGE_DOCUMENTS,
    };
    
    return userPermissions.includes(permissionMap[doc.category] || Permission.MANAGE_DOCUMENTS);
  }) : [];

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Document Management
            </h1>
            <div className="flex items-center space-x-4">
              <a
                href="/admin/documents/logs"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <History className="h-4 w-4 mr-2" />
                Document Activity Logs
              </a>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <form className="flex w-full md:w-1/2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
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
                  <RefreshCw className={`h-4 w-4`} />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | "")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {Object.values(DocumentCategory).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Language
                  </label>
                  <select 
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                  >
                    <option value="">All Languages</option>
                    <option value={Language.FRENCH}>French</option>
                    <option value={Language.ARABIC}>Arabic</option>
                    <option value={Language.ENGLISH}>English</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Document grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mr-2" />
              <span>Loading...</span>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDocuments.map((doc) => (
                  <li key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="ml-3">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{doc.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              {doc.category}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              {doc.language}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                              Views: {doc.viewCount || 0}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                              Downloads: {doc.downloadCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-4 md:mt-0 space-x-2">
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <a
                        href={`/admin/documents/logs?documentId=${doc.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <History className="h-4 w-4 mr-2" />
                        History
                      </a>
                      <button
                        onClick={() => setShowDeleteConfirm(doc.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm text-white bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Documents Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                There are no documents available matching your criteria. You can upload a new document to get started.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Document
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Confirm Delete
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this document? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Simulate delete
                      setTimeout(() => {
                        setShowDeleteConfirm(null);
                      }, 500);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowUploadModal(false)}></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 z-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Upload New Document
                  </h2>
                  <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Simple document upload form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter document title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter document description"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.values(DocumentCategory).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Language
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={Language.ENGLISH}>English</option>
                      <option value={Language.FRENCH}>French</option>
                      <option value={Language.ARABIC}>Arabic</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Simulate upload
                      setTimeout(() => {
                        setShowUploadModal(false);
                      }, 500);
                    }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </I18nProvider>
  );
};

const meta: Meta<typeof MockAdminDocumentsPage> = {
  title: 'pages/AdminDocumentsPage',
  component: MockAdminDocumentsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Admin interface for document management with filtering, searching, and CRUD operations. Supports role-based access control based on document categories and user permissions.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    userPermissions: {
      control: 'multi-select',
      options: Object.values(Permission),
      description: 'User permissions that control document access',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    noDocuments: {
      control: 'boolean',
      description: 'Show empty state with no documents',
    },
    isAdmin: {
      control: 'boolean',
      description: 'Whether the user is an admin (can manage all documents)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MockAdminDocumentsPage>;

export const Default: Story = {
  args: {
    userPermissions: [Permission.MANAGE_DOCUMENTS],
    isLoading: false,
    noDocuments: false,
    isAdmin: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default admin documents page with full permissions.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    userPermissions: [Permission.MANAGE_DOCUMENTS],
    isLoading: true,
    noDocuments: false,
    isAdmin: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state of the admin documents page.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    userPermissions: [Permission.MANAGE_DOCUMENTS],
    isLoading: false,
    noDocuments: true,
    isAdmin: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no documents are available.',
      },
    },
  },
};

export const ContentEditorView: Story = {
  args: {
    userPermissions: [Permission.MANAGE_COMITE_DOCUMENTS, Permission.MANAGE_LEGAL_DOCUMENTS],
    isLoading: false,
    noDocuments: false,
    isAdmin: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Limited access view for a content editor who can only manage documents in specific categories.',
      },
    },
  },
}; 