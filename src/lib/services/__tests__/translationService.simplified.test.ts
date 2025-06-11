// Simplified Translation Service Tests - TDD Core Features
// Focus on essential functionality first

import { TranslationService } from '../translationService';
import { TranslationStatus, Language } from '@prisma/client';

// Mock Prisma for translation service testing
jest.mock('@/lib/db', () => ({
  db: {
    document: {
      findUnique: jest.fn(),
    },
    documentTranslation: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
  },
}));

// Test data
const mockDocument = {
  id: 'doc-123',
  title: 'HOA Regulations',
  filePath: '/documents/hoa-regulations.pdf',
  fileSize: BigInt(2048),
  category: 'legal',
  language: 'fr' as Language,
};

const mockTranslationRequest = {
  document_id: 'doc-123',
  source_language: 'fr' as Language,
  target_language: 'en' as Language,
  requested_by: 'user-123',
};

describe('TranslationService - Core Features', () => {
  let translationService: TranslationService;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = require('@/lib/db').db;
    
    // Setup basic mocks
    mockDb.document.findUnique.mockResolvedValue(mockDocument);
    mockDb.documentTranslation.findUnique.mockResolvedValue(null);
    
    translationService = new TranslationService();
  });

  describe('Translation Request Creation', () => {
    it('should create a translation request successfully', async () => {
      const mockResponse = {
        id: 'translation-456',
        ...mockTranslationRequest,
        status: 'pending',
        estimated_cost_cents: 25,
        progress: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.documentTranslation.create.mockResolvedValue(mockResponse);

      const result = await translationService.requestTranslation(mockTranslationRequest);

      expect(result.id).toBe('translation-456');
      expect(result.status).toBe('pending');
      expect(result.estimated_cost_cents).toBe(25);
      expect(mockDb.documentTranslation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          document_id: 'doc-123',
          target_language: 'en',
          requested_by: 'user-123',
          status: 'pending',
        })
      });
    });

    it('should reject requests for non-existent documents', async () => {
      mockDb.document.findUnique.mockResolvedValue(null);

      await expect(
        translationService.requestTranslation(mockTranslationRequest)
      ).rejects.toThrow('Document not found');
    });

    it('should reject duplicate translation requests', async () => {
      const existingTranslation = { id: 'existing-123' };
      mockDb.documentTranslation.findUnique.mockResolvedValue(existingTranslation);

      await expect(
        translationService.requestTranslation(mockTranslationRequest)
      ).rejects.toThrow('Translation already exists for this document and language');
    });
  });

  describe('Translation Processing', () => {
    it('should start processing with a valid service', async () => {
      const translation = { id: 'translation-456', status: 'pending' };
      const updatedTranslation = {
        ...translation,
        status: 'in_progress',
        service_used: 'deepl',
        started_at: new Date(),
        progress: 10,
      };

      mockDb.documentTranslation.findUnique.mockResolvedValue(translation);
      mockDb.documentTranslation.update.mockResolvedValue(updatedTranslation);

      const result = await translationService.processTranslation('translation-456', 'deepl');

      expect(result.status).toBe('in_progress');
      expect(result.service_used).toBe('deepl');
      expect(mockDb.documentTranslation.update).toHaveBeenCalledWith({
        where: { id: 'translation-456' },
        data: expect.objectContaining({
          status: 'in_progress',
          service_used: 'deepl',
          progress: 10,
        })
      });
    });

    it('should reject invalid translation services', async () => {
      const translation = { id: 'translation-456', status: 'pending' };
      mockDb.documentTranslation.findUnique.mockResolvedValue(translation);

      await expect(
        translationService.processTranslation('translation-456', 'invalid-service')
      ).rejects.toThrow('Translation service not available');
    });
  });

  describe('Translation Completion', () => {
    it('should complete translation with results', async () => {
      const completedTranslation = {
        id: 'translation-456',
        status: 'completed',
        translated_content: 'Translated content',
        confidence_score: 0.95,
        actual_cost_cents: 25,
        completed_at: new Date(),
        progress: 100,
      };

      mockDb.documentTranslation.update.mockResolvedValue(completedTranslation);

      const result = await translationService.completeTranslation(
        'translation-456',
        'Translated content',
        0.95,
        25
      );

      expect(result.status).toBe('completed');
      expect(result.translated_content).toBe('Translated content');
      expect(result.confidence_score).toBe(0.95);
      expect(result.actual_cost_cents).toBe(25);
    });

    it('should handle translation failures', async () => {
      const failedTranslation = {
        id: 'translation-456',
        status: 'failed',
        error_message: 'Service unavailable',
        completed_at: new Date(),
      };

      mockDb.documentTranslation.update.mockResolvedValue(failedTranslation);

      const result = await translationService.failTranslation(
        'translation-456',
        'Service unavailable'
      );

      expect(result.status).toBe('failed');
      expect(result.error_message).toBe('Service unavailable');
    });
  });

  describe('Cost Estimation', () => {
    it('should calculate estimated costs based on document size', async () => {
      const cost = await translationService.estimateTranslationCost(
        'doc-123',
        'deepl',
        'fr',
        'en'
      );

      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThan(0);
    });

    it('should handle missing documents in cost estimation', async () => {
      mockDb.document.findUnique.mockResolvedValue(null);

      await expect(
        translationService.estimateTranslationCost('invalid-doc', 'deepl', 'fr', 'en')
      ).rejects.toThrow('Document not found');
    });
  });

  describe('Quality Assessment', () => {
    it('should assess translation quality', async () => {
      const score = await translationService.assessQuality(
        'Bonjour le monde',
        'Hello world',
        'fr',
        'en'
      );

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('User Feedback', () => {
    it('should accept valid user ratings', async () => {
      const updatedTranslation = {
        id: 'translation-456',
        user_rating: 5,
        user_feedback: 'Excellent!',
      };

      mockDb.documentTranslation.update.mockResolvedValue(updatedTranslation);

      const result = await translationService.addUserFeedback(
        'translation-456',
        5,
        'Excellent!'
      );

      expect(result.user_rating).toBe(5);
      expect(result.user_feedback).toBe('Excellent!');
    });

    it('should reject invalid rating ranges', async () => {
      await expect(
        translationService.addUserFeedback('translation-456', 6, 'Too high')
      ).rejects.toThrow('Rating must be between 1 and 5');

      await expect(
        translationService.addUserFeedback('translation-456', 0, 'Too low')
      ).rejects.toThrow('Rating must be between 1 and 5');
    });
  });
});