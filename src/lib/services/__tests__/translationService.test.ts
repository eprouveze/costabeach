// Translation Service Tests - TDD Implementation
// Following Red-Green-Refactor methodology

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

// Test data following established patterns
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

const mockTranslationResponse = {
  id: 'translation-456',
  ...mockTranslationRequest,
  status: 'pending' as TranslationStatus,
  estimated_cost_cents: 25,
  actual_cost_cents: null,
  translated_content: null,
  confidence_score: null,
  quality_score: null,
  user_rating: null,
  user_feedback: null,
  service_used: null,
  job_id: null,
  started_at: null,
  completed_at: null,
  error_message: null,
  progress: 0,
  notes: null,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('TranslationService', () => {
  let translationService: TranslationService;
  let mockDb: any;

  beforeEach(() => {
    // Reset mocks for each test
    jest.clearAllMocks();
    
    // Get mock database instance
    mockDb = require('@/lib/db').db;
    
    // Set up default mock responses
    mockDb.document.findUnique.mockResolvedValue(mockDocument);
    mockDb.documentTranslation.findUnique.mockResolvedValue(null);
    mockDb.documentTranslation.create.mockResolvedValue(mockTranslationResponse);
    mockDb.documentTranslation.update.mockResolvedValue(mockTranslationResponse);
    mockDb.documentTranslation.findMany.mockResolvedValue([]);
    mockDb.documentTranslation.count.mockResolvedValue(0);
    mockDb.documentTranslation.aggregate.mockResolvedValue({
      _sum: { actual_cost_cents: 0 },
      _avg: { actual_cost_cents: 0 }
    });
    
    // Initialize service for each test
    translationService = new TranslationService();
  });

  describe('Request Translation', () => {
    it('should create a new translation request', async () => {
      // RED: This test will fail initially until we implement the service

      const result = await translationService.requestTranslation(mockTranslationRequest);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.document_id).toBe(mockTranslationRequest.document_id);
      expect(result.target_language).toBe(mockTranslationRequest.target_language);
      expect(result.status).toBe('pending');
    });

    it('should reject duplicate translation requests', async () => {
      // Set up mock to return existing translation on second call
      mockDb.documentTranslation.findUnique
        .mockResolvedValueOnce(null) // First call - no existing translation
        .mockResolvedValueOnce(mockTranslationResponse); // Second call - existing translation

      // First request should succeed
      await translationService.requestTranslation(mockTranslationRequest);

      // Second request for same document+language should fail
      await expect(
        translationService.requestTranslation(mockTranslationRequest)
      ).rejects.toThrow('Translation already exists for this document and language');
    });

    it('should estimate translation cost', async () => {
      const result = await translationService.requestTranslation(mockTranslationRequest);

      expect(result.estimated_cost_cents).toBeDefined();
      expect(typeof result.estimated_cost_cents).toBe('number');
      expect(result.estimated_cost_cents).toBeGreaterThan(0);
    });
  });

  describe('Process Translation', () => {
    it('should process translation with DeepL service', async () => {
      // First create a translation request
      const translation = await translationService.requestTranslation(mockTranslationRequest);

      // Mock finding the translation for processing
      mockDb.documentTranslation.findUnique.mockResolvedValue(translation);
      mockDb.documentTranslation.update.mockResolvedValue({
        ...translation,
        status: 'in_progress',
        service_used: 'deepl',
        started_at: new Date(),
        progress: 10,
      });

      // Process the translation
      const result = await translationService.processTranslation(translation.id, 'deepl');

      expect(result.status).toBe('in_progress');
      expect(result.service_used).toBe('deepl');
      expect(result.started_at).toBeDefined();
    });

    it('should process translation with OpenAI service', async () => {
      const translation = await translationService.requestTranslation(mockTranslationRequest);

      // Mock finding and updating translation
      mockDb.documentTranslation.findUnique.mockResolvedValue(translation);
      mockDb.documentTranslation.update.mockResolvedValue({
        ...translation,
        status: 'in_progress',
        service_used: 'openai',
        started_at: new Date(),
        progress: 10,
      });

      const result = await translationService.processTranslation(translation.id, 'openai');

      expect(result.status).toBe('in_progress');
      expect(result.service_used).toBe('openai');
      expect(result.started_at).toBeDefined();
    });

    it('should handle translation completion', async () => {
      const translation = await translationService.requestTranslation(mockTranslationRequest);
      await translationService.processTranslation(translation.id, 'deepl');

      // Simulate completed translation
      const result = await translationService.completeTranslation(
        translation.id,
        'Translated content goes here',
        0.95,
        25 // cost in cents
      );

      expect(result.status).toBe('completed');
      expect(result.translated_content).toBe('Translated content goes here');
      expect(result.confidence_score).toBe(0.95);
      expect(result.actual_cost_cents).toBe(25);
      expect(result.completed_at).toBeDefined();
    });

    it('should handle translation failures', async () => {
      const translation = await translationService.requestTranslation(mockTranslationRequest);
      await translationService.processTranslation(translation.id, 'deepl');

      const result = await translationService.failTranslation(
        translation.id,
        'Service temporarily unavailable'
      );

      expect(result.status).toBe('failed');
      expect(result.error_message).toBe('Service temporarily unavailable');
    });
  });

  describe('Translation Quality Assessment', () => {
    it('should assess translation quality using AI', async () => {
      const originalText = 'Bonjour, comment allez-vous?';
      const translatedText = 'Hello, how are you?';

      const qualityScore = await translationService.assessQuality(
        originalText,
        translatedText,
        'fr',
        'en'
      );

      expect(qualityScore).toBeGreaterThan(0);
      expect(qualityScore).toBeLessThanOrEqual(1);
    });

    it('should update translation quality score', async () => {
      const translation = await translationService.requestTranslation(mockTranslationRequest);

      // Mock the update with quality score
      mockDb.documentTranslation.update.mockResolvedValue({
        ...translation,
        quality_score: 0.88,
      });

      const result = await translationService.updateQualityScore(translation.id, 0.88);

      expect(result.quality_score).toBe(0.88);
    });
  });

  describe('User Feedback', () => {
    it('should record user rating and feedback', async () => {
      const translation = await translationService.requestTranslation(mockTranslationRequest);
      await translationService.completeTranslation(translation.id, 'Translated content', 0.95, 25);

      const result = await translationService.addUserFeedback(
        translation.id,
        5,
        'Excellent translation quality'
      );

      expect(result.user_rating).toBe(5);
      expect(result.user_feedback).toBe('Excellent translation quality');
    });

    it('should validate rating range', async () => {
      const translation = await translationService.requestTranslation(mockTranslationRequest);
      
      await expect(
        translationService.addUserFeedback(translation.id, 6, 'Invalid rating')
      ).rejects.toThrow('Rating must be between 1 and 5');

      await expect(
        translationService.addUserFeedback(translation.id, 0, 'Invalid rating')
      ).rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('Translation Management', () => {
    it('should list translations by document', async () => {
      // Create multiple translations for same document
      await translationService.requestTranslation({
        ...mockTranslationRequest,
        target_language: 'en'
      });

      await translationService.requestTranslation({
        ...mockTranslationRequest,
        target_language: 'ar'
      });

      const translations = await translationService.getTranslationsByDocument('doc-123');

      expect(translations).toHaveLength(2);
      expect(translations.some(t => t.target_language === 'en')).toBe(true);
      expect(translations.some(t => t.target_language === 'ar')).toBe(true);
    });

    it('should list translations by user', async () => {
      await translationService.requestTranslation(mockTranslationRequest);

      const translations = await translationService.getTranslationsByUser('user-123');

      expect(translations).toHaveLength(1);
      expect(translations[0].requested_by).toBe('user-123');
    });

    it('should get translation statistics', async () => {
      // Create translations with different statuses
      const translation1 = await translationService.requestTranslation(mockTranslationRequest);
      const translation2 = await translationService.requestTranslation({
        ...mockTranslationRequest,
        document_id: 'doc-456',
        target_language: 'ar'
      });

      await translationService.completeTranslation(translation1.id, 'Completed', 0.95, 25);

      const stats = await translationService.getTranslationStats();

      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.total_cost_cents).toBe(25);
    });
  });

  describe('Cost Management', () => {
    it('should calculate estimated cost based on document size', async () => {
      const cost = await translationService.estimateTranslationCost(
        'doc-123',
        'deepl',
        'fr',
        'en'
      );

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
    });

    it('should track actual costs vs estimates', async () => {
      const translation = await translationService.requestTranslation(mockTranslationRequest);
      await translationService.completeTranslation(translation.id, 'Translated', 0.95, 30);

      const result = await translationService.getTranslationById(translation.id);

      expect(result?.estimated_cost_cents).toBeDefined();
      expect(result?.actual_cost_cents).toBe(30);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid document ID', async () => {
      // Mock document not found
      mockDb.document.findUnique.mockResolvedValue(null);

      await expect(
        translationService.requestTranslation({
          ...mockTranslationRequest,
          document_id: 'invalid-doc-id'
        })
      ).rejects.toThrow('Document not found');
    });

    it('should handle invalid translation ID', async () => {
      // Mock translation not found
      mockDb.documentTranslation.findUnique.mockResolvedValue(null);

      await expect(
        translationService.processTranslation('invalid-translation-id', 'deepl')
      ).rejects.toThrow('Translation not found');
    });

    it('should handle service unavailability', async () => {
      // Mock service failure
      const translation = await translationService.requestTranslation(mockTranslationRequest);

      // Simulate service failure during processing
      await expect(
        translationService.processTranslation(translation.id, 'invalid-service')
      ).rejects.toThrow('Translation service not available');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple translation requests safely', async () => {
      const requests = Array(5).fill(null).map((_, index) => 
        translationService.requestTranslation({
          ...mockTranslationRequest,
          document_id: `doc-${index}`,
        })
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.id).toBeDefined();
        expect(result.status).toBe('pending');
      });
    });

    it('should handle concurrent processing safely', async () => {
      // Create multiple translations
      const translations = await Promise.all(
        Array(3).fill(null).map((_, index) =>
          translationService.requestTranslation({
            ...mockTranslationRequest,
            document_id: `doc-${index}`,
          })
        )
      );

      // Process them concurrently
      const processes = translations.map(t =>
        translationService.processTranslation(t.id, 'deepl')
      );

      const results = await Promise.all(processes);

      results.forEach(result => {
        expect(result.status).toBe('in_progress');
        expect(result.service_used).toBe('deepl');
      });
    });
  });
});