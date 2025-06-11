// Translation API Route Tests - TDD Implementation
// Testing the RESTful API endpoints for document translation

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((input, init) => ({
    url: input,
    method: init?.method || 'GET',
    json: jest.fn().mockResolvedValue(init?.body ? JSON.parse(init.body) : {}),
    headers: new Map(Object.entries(init?.headers || {})),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options = {}) => ({
      status: options.status || 200,
      json: jest.fn().mockResolvedValue(data),
    })),
  },
}));

import { GET, POST } from '../route';

// Mock the translation service
jest.mock('@/lib/services/translationService', () => ({
  TranslationService: jest.fn().mockImplementation(() => ({
    requestTranslation: jest.fn(),
    getTranslationsByUser: jest.fn(),
    getTranslationsByDocument: jest.fn(),
    getTranslationStats: jest.fn(),
  })),
}));

// Mock authentication
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'user',
};

const mockTranslation = {
  id: 'translation-456',
  document_id: 'doc-123',
  source_language: 'fr',
  target_language: 'en',
  status: 'pending',
  requested_by: 'user-123',
  estimated_cost_cents: 25,
  created_at: new Date(),
};

describe('/api/translations', () => {
  let mockTranslationService: any;
  let mockGetCurrentUser: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTranslationService = require('@/lib/services/translationService').TranslationService.mock.instances[0];
    mockGetCurrentUser = require('@/lib/auth').getCurrentUser;
    
    // Setup default auth mock
    mockGetCurrentUser.mockResolvedValue(mockUser);
  });

  describe('GET /api/translations', () => {
    it('should return user translations when authenticated', async () => {
      const mockTranslations = [mockTranslation];
      mockTranslationService.getTranslationsByUser.mockResolvedValue(mockTranslations);

      const request = new NextRequest('http://localhost:3000/api/translations');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.translations).toEqual(mockTranslations);
      expect(mockTranslationService.getTranslationsByUser).toHaveBeenCalledWith('user-123');
    });

    it('should return translations by document when document_id provided', async () => {
      const mockDocumentTranslations = [mockTranslation];
      mockTranslationService.getTranslationsByDocument.mockResolvedValue(mockDocumentTranslations);

      const request = new NextRequest('http://localhost:3000/api/translations?document_id=doc-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.translations).toEqual(mockDocumentTranslations);
      expect(mockTranslationService.getTranslationsByDocument).toHaveBeenCalledWith('doc-123');
    });

    it('should return stats when stats=true parameter provided', async () => {
      const mockStats = {
        total: 10,
        pending: 3,
        in_progress: 2,
        completed: 4,
        failed: 1,
        total_cost_cents: 250,
        average_cost_cents: 25,
      };
      mockTranslationService.getTranslationStats.mockResolvedValue(mockStats);

      const request = new NextRequest('http://localhost:3000/api/translations?stats=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats).toEqual(mockStats);
      expect(mockTranslationService.getTranslationStats).toHaveBeenCalled();
    });

    it('should return 401 when user not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/translations');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should handle service errors gracefully', async () => {
      mockTranslationService.getTranslationsByUser.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/translations');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/translations', () => {
    const validRequestBody = {
      document_id: 'doc-123',
      source_language: 'fr',
      target_language: 'en',
    };

    it('should create a new translation request', async () => {
      mockTranslationService.requestTranslation.mockResolvedValue(mockTranslation);

      const request = new NextRequest('http://localhost:3000/api/translations', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.translation).toEqual(mockTranslation);
      expect(mockTranslationService.requestTranslation).toHaveBeenCalledWith({
        ...validRequestBody,
        requested_by: 'user-123',
      });
    });

    it('should return 400 for invalid request body', async () => {
      const invalidBody = {
        document_id: 'doc-123',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/translations', {
        method: 'POST',
        body: JSON.stringify(invalidBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 401 when user not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/translations', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should handle duplicate translation requests', async () => {
      mockTranslationService.requestTranslation.mockRejectedValue(
        new Error('Translation already exists for this document and language')
      );

      const request = new NextRequest('http://localhost:3000/api/translations', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(409); // Conflict
    });

    it('should handle document not found errors', async () => {
      mockTranslationService.requestTranslation.mockRejectedValue(
        new Error('Document not found')
      );

      const request = new NextRequest('http://localhost:3000/api/translations', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
    });

    it('should validate language codes', async () => {
      const invalidLanguageBody = {
        document_id: 'doc-123',
        source_language: 'invalid',
        target_language: 'also-invalid',
      };

      const request = new NextRequest('http://localhost:3000/api/translations', {
        method: 'POST',
        body: JSON.stringify(invalidLanguageBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle service errors gracefully', async () => {
      mockTranslationService.requestTranslation.mockRejectedValue(
        new Error('Internal service error')
      );

      const request = new NextRequest('http://localhost:3000/api/translations', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});