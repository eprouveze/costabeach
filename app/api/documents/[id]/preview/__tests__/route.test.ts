import { GET } from '../route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { getDownloadUrl } from '@/lib/utils/documents';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  prisma: {
    document: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/utils/documents', () => ({
  getDownloadUrl: jest.fn(),
}));

describe('Document Preview API Route', () => {
  const mockRequest = new NextRequest('https://example.com/api/documents/123/preview');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('returns 404 when document is not found', async () => {
    // Mock document not found
    (prisma.document.findUnique as jest.Mock).mockResolvedValue(null);
    
    const response = await GET(mockRequest, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();
    
    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Document not found' });
  });
  
  it('returns preview URL for published document', async () => {
    // Mock published document
    const mockDocument = {
      id: '123',
      title: 'Test Document',
      isPublished: true,
      filePath: 'documents/test.pdf',
    };
    
    (prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDocument);
    (prisma.document.update as jest.Mock).mockResolvedValue({ ...mockDocument, viewCount: 1 });
    (getDownloadUrl as jest.Mock).mockResolvedValue('https://example.com/preview-url');
    
    const response = await GET(mockRequest, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({ url: 'https://example.com/preview-url' });
    expect(prisma.document.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: { viewCount: { increment: 1 } },
    });
  });
  
  it('checks authentication for unpublished document', async () => {
    // Mock unpublished document
    const mockDocument = {
      id: '123',
      title: 'Test Document',
      isPublished: false,
      filePath: 'documents/test.pdf',
      authorId: 'user-123',
    };
    
    (prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDocument);
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    const response = await GET(mockRequest, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });
  
  it('allows author to view unpublished document', async () => {
    // Mock unpublished document
    const mockDocument = {
      id: '123',
      title: 'Test Document',
      isPublished: false,
      filePath: 'documents/test.pdf',
      authorId: 'user-123',
    };
    
    // Mock authenticated user as author
    (prisma.document.findUnique as jest.Mock).mockResolvedValue(mockDocument);
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123' },
    });
    (prisma.document.update as jest.Mock).mockResolvedValue({ ...mockDocument, viewCount: 1 });
    (getDownloadUrl as jest.Mock).mockResolvedValue('https://example.com/preview-url');
    
    const response = await GET(mockRequest, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({ url: 'https://example.com/preview-url' });
  });
  
  it('handles server errors gracefully', async () => {
    // Mock database error
    (prisma.document.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    const response = await GET(mockRequest, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to retrieve document preview' });
  });
}); 