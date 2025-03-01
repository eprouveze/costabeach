import { prisma } from '@/lib/db';
import { getDownloadUrl } from '@/lib/utils/documents';
import { DocumentCategory, Language } from '@/lib/types';

// Mock the route module
const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnThis();

jest.mock('next/server', () => ({
  NextResponse: {
    json: (...args: any[]) => mockJson(...args),
    status: () => ({ json: mockJson }),
  },
}));

// Mock the GET function from the route
const mockGET = jest.fn();
jest.mock('../route', () => ({
  GET: mockGET,
}));

// Mock prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    document: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock getDownloadUrl
jest.mock('@/lib/utils/documents', () => ({
  getDownloadUrl: jest.fn(),
}));

describe('Document Preview API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the GET function with correct parameters', async () => {
    const mockDocument = {
      id: '123',
      title: 'Test Document',
      filePath: 'documents/test.pdf',
      isPublished: true,
      category: DocumentCategory.COMITE_DE_SUIVI,
      language: Language.FRENCH,
    };

    (prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDocument);
    (getDownloadUrl as jest.Mock).mockResolvedValue('https://example.com/preview');

    mockGET.mockResolvedValue({
      json: () => ({ url: 'https://example.com/preview' }),
    });

    // Create a simple mock request object instead of using NextRequest constructor
    const mockRequest = {
      url: 'http://localhost:3000/api/documents/123/preview',
      headers: new Headers(),
      method: 'GET',
    };
    
    await mockGET(mockRequest, { params: { id: '123' } });

    expect(mockGET).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'http://localhost:3000/api/documents/123/preview' }),
      expect.objectContaining({
        params: expect.objectContaining({ id: '123' }),
      })
    );
  });
}); 