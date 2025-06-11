// Simplified Translation API Tests - Core functionality only
// Testing the essential API endpoints

// Mock Next.js components
const mockJson = jest.fn();
const mockNextResponse = {
  json: jest.fn().mockImplementation((data, options = {}) => ({
    status: options.status || 200,
    json: mockJson.mockResolvedValue(data),
  })),
};

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: mockNextResponse,
}));

// Mock services
const mockTranslationService = {
  requestTranslation: jest.fn(),
  getTranslationsByUser: jest.fn(),
  getTranslationsByDocument: jest.fn(),
  getTranslationStats: jest.fn(),
};

jest.mock('@/lib/services/translationService', () => ({
  TranslationService: jest.fn().mockImplementation(() => mockTranslationService),
}));

// Mock auth
const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}));

// Import after mocks
import { GET, POST } from '../route';

describe('Translation API - Core Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth mock
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      role: 'user',
    });
  });

  describe('POST /api/translations', () => {
    it('should create translation request successfully', async () => {
      const mockTranslation = {
        id: 'translation-456',
        document_id: 'doc-123',
        status: 'pending',
        estimated_cost_cents: 25,
      };

      mockTranslationService.requestTranslation.mockResolvedValue(mockTranslation);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          document_id: 'doc-123',
          source_language: 'french',
          target_language: 'arabic',
        }),
      } as any;

      const response = await POST(mockRequest);

      expect(mockTranslationService.requestTranslation).toHaveBeenCalledWith({
        document_id: 'doc-123',
        source_language: 'french',
        target_language: 'arabic',
        requested_by: 'user-123',
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { translation: mockTranslation },
        { status: 201 }
      );
    });

    it('should handle authentication errors', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          document_id: 'doc-123',
          source_language: 'french',
          target_language: 'arabic',
        }),
      } as any;

      await POST(mockRequest);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Authentication required' },
        { status: 401 }
      );
    });

    it('should handle validation errors', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          document_id: 'doc-123',
          // Missing required fields
        }),
      } as any;

      await POST(mockRequest);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: expect.stringContaining('Invalid request body') },
        { status: 400 }
      );
    });

    it('should handle service errors', async () => {
      mockTranslationService.requestTranslation.mockRejectedValue(
        new Error('Document not found')
      );

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          document_id: 'invalid-doc',
          source_language: 'french',
          target_language: 'arabic',
        }),
      } as any;

      await POST(mockRequest);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Document not found' },
        { status: 404 }
      );
    });
  });

  describe('GET /api/translations', () => {
    it('should return user translations', async () => {
      const mockTranslations = [
        { id: 'translation-1', status: 'completed' },
        { id: 'translation-2', status: 'pending' },
      ];

      mockTranslationService.getTranslationsByUser.mockResolvedValue(mockTranslations);

      const mockRequest = {
        url: 'http://localhost:3000/api/translations',
      } as any;

      await GET(mockRequest);

      expect(mockTranslationService.getTranslationsByUser).toHaveBeenCalledWith('user-123');
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        translations: mockTranslations,
      });
    });

    it('should return translation stats when requested', async () => {
      const mockStats = {
        total: 10,
        pending: 3,
        completed: 7,
        total_cost_cents: 250,
      };

      mockTranslationService.getTranslationStats.mockResolvedValue(mockStats);

      const mockRequest = {
        url: 'http://localhost:3000/api/translations?stats=true',
      } as any;

      await GET(mockRequest);

      expect(mockTranslationService.getTranslationStats).toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        stats: mockStats,
      });
    });

    it('should handle authentication errors', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const mockRequest = {
        url: 'http://localhost:3000/api/translations',
      } as any;

      await GET(mockRequest);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Authentication required' },
        { status: 401 }
      );
    });
  });
});