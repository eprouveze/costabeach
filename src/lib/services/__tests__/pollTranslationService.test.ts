// Poll Translation Service Tests
// Following TDD methodology and existing test patterns

import { PollTranslationService } from '../pollTranslationService';
import { TranslationService } from '../translationService';

// Mock the dependencies
jest.mock('../translationService', () => ({
  TranslationService: jest.fn().mockImplementation(() => ({
    translateText: jest.fn(),
  })),
}));

jest.mock('@/lib/db', () => ({
  db: {
    poll: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    pollTranslation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('PollTranslationService', () => {
  let service: PollTranslationService;
  let mockTranslationService: any;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get mocked database
    const { db } = require('@/lib/db');
    mockDb = db;

    // Create service instance - this will create a mocked TranslationService
    service = new PollTranslationService();
    
    // Get the mocked translation service instance
    mockTranslationService = (service as any).translationService;
  });

  describe('createPollTranslation', () => {
    it('should create a new poll translation', async () => {
      const pollData = {
        id: 'poll-123',
        question: 'Should we install new playground equipment?',
        description: 'This is a community decision.',
        poll_type: 'single_choice',
        status: 'active',
      };

      const translationData = {
        poll_id: 'poll-123',
        language: 'arabic' as const,
        question: 'هل يجب أن نقوم بتثبيت معدات ملعب جديدة؟',
        description: 'هذا قرار مجتمعي.',
      };

      // Mock poll exists
      mockDb.poll.findUnique.mockResolvedValue(pollData);
      
      // Mock no existing translation
      mockDb.pollTranslation.findUnique.mockResolvedValue(null);
      
      // Mock successful creation
      const expectedTranslation = {
        id: 'translation-123',
        ...translationData,
        created_at: new Date(),
      };
      mockDb.pollTranslation.create.mockResolvedValue(expectedTranslation);

      const result = await service.createPollTranslation(translationData);

      expect(mockDb.poll.findUnique).toHaveBeenCalledWith({
        where: { id: 'poll-123' },
      });
      expect(mockDb.pollTranslation.findUnique).toHaveBeenCalledWith({
        where: {
          poll_id_language: {
            poll_id: 'poll-123',
            language: 'arabic',
          },
        },
      });
      expect(mockDb.pollTranslation.create).toHaveBeenCalledWith({
        data: translationData,
      });
      expect(result).toEqual(expectedTranslation);
    });

    it('should throw error if poll does not exist', async () => {
      mockDb.poll.findUnique.mockResolvedValue(null);

      await expect(
        service.createPollTranslation({
          poll_id: 'non-existent',
          language: 'arabic',
          question: 'Question',
        })
      ).rejects.toThrow('Poll not found');
    });

    it('should throw error if translation already exists', async () => {
      mockDb.poll.findUnique.mockResolvedValue({ id: 'poll-123' });
      mockDb.pollTranslation.findUnique.mockResolvedValue({
        id: 'existing-translation',
        poll_id: 'poll-123',
        language: 'arabic',
      });

      await expect(
        service.createPollTranslation({
          poll_id: 'poll-123',
          language: 'arabic',
          question: 'Question',
        })
      ).rejects.toThrow('Translation already exists for this language');
    });
  });

  describe('getLocalizedPoll', () => {
    it('should return poll with translation when available', async () => {
      const pollData = {
        id: 'poll-123',
        question: 'Should we install new playground equipment?',
        description: 'This is a community decision.',
        poll_type: 'single_choice',
        status: 'active',
        is_anonymous: true,
        end_date: new Date('2025-12-31'),
        created_at: new Date('2025-01-01'),
        options: [
          { id: 'opt-1', option_text: 'Yes', order_index: 0 },
          { id: 'opt-2', option_text: 'No', order_index: 1 },
        ],
      };

      const translationData = {
        poll_id: 'poll-123',
        language: 'arabic',
        question: 'هل يجب أن نقوم بتثبيت معدات ملعب جديدة؟',
        description: 'هذا قرار مجتمعي.',
      };

      mockDb.poll.findUnique.mockResolvedValue(pollData);
      mockDb.pollTranslation.findUnique.mockResolvedValue(translationData);

      const result = await service.getLocalizedPoll('poll-123', 'arabic');

      expect(result).toEqual({
        id: 'poll-123',
        question: 'هل يجب أن نقوم بتثبيت معدات ملعب جديدة؟',
        description: 'هذا قرار مجتمعي.',
        poll_type: 'single_choice',
        status: 'active',
        is_anonymous: true,
        voting_deadline: new Date('2025-12-31'),
        created_at: new Date('2025-01-01'),
        language: 'arabic',
        options: [
          { id: 'opt-1', option_text: 'Yes', option_order: 0 },
          { id: 'opt-2', option_text: 'No', option_order: 1 },
        ],
      });
    });

    it('should return poll with original text when no translation available', async () => {
      const pollData = {
        id: 'poll-123',
        question: 'Should we install new playground equipment?',
        description: 'This is a community decision.',
        poll_type: 'single_choice',
        status: 'active',
        is_anonymous: true,
        end_date: null,
        created_at: new Date('2025-01-01'),
        options: [
          { id: 'opt-1', option_text: 'Yes', order_index: 0 },
        ],
      };

      mockDb.poll.findUnique.mockResolvedValue(pollData);
      mockDb.pollTranslation.findUnique.mockResolvedValue(null);

      const result = await service.getLocalizedPoll('poll-123', 'arabic');

      expect(result).toEqual({
        id: 'poll-123',
        question: 'Should we install new playground equipment?',
        description: 'This is a community decision.',
        poll_type: 'single_choice',
        status: 'active',
        is_anonymous: true,
        voting_deadline: undefined,
        created_at: new Date('2025-01-01'),
        language: 'french', // Fallback to default
        options: [
          { id: 'opt-1', option_text: 'Yes', option_order: 0 },
        ],
      });
    });

    it('should return null if poll does not exist', async () => {
      mockDb.poll.findUnique.mockResolvedValue(null);

      const result = await service.getLocalizedPoll('non-existent', 'arabic');

      expect(result).toBeNull();
    });
  });

  describe('requestPollTranslation', () => {
    it('should successfully request translation for multiple languages', async () => {
      const pollData = {
        id: 'poll-123',
        question: 'Should we install new playground equipment?',
        description: 'Community decision',
        options: [
          { id: 'opt-1', option_text: 'Yes' },
          { id: 'opt-2', option_text: 'No' },
        ],
      };

      const request = {
        poll_id: 'poll-123',
        target_languages: ['arabic' as const],
        requested_by: 'user-123',
      };

      // Mock poll exists
      mockDb.poll.findUnique.mockResolvedValue(pollData);
      
      // Mock no existing translation
      mockDb.pollTranslation.findUnique.mockResolvedValue(null);
      
      // Mock translation service
      mockTranslationService.translateText.mockResolvedValue({
        translation: 'هل يجب أن نقوم بتثبيت معدات ملعب جديدة؟',
        confidence: 0.95,
        service: 'deepl',
      });

      // Mock successful creation
      const expectedTranslation = {
        id: 'translation-123',
        poll_id: 'poll-123',
        language: 'arabic',
        question: 'هل يجب أن نقوم بتثبيت معدات ملعب جديدة؟',
        description: 'قرار مجتمعي',
        created_at: new Date(),
      };
      mockDb.pollTranslation.create.mockResolvedValue(expectedTranslation);

      const results = await service.requestPollTranslation(request);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        language: 'arabic',
        status: 'created',
        translation: expectedTranslation,
      });
      expect(mockTranslationService.translateText).toHaveBeenCalledTimes(2); // Question + description
    });

    it('should handle existing translations', async () => {
      const pollData = {
        id: 'poll-123',
        question: 'Question',
        options: [],
      };

      const existingTranslation = {
        id: 'existing-translation',
        poll_id: 'poll-123',
        language: 'arabic',
        question: 'Existing question',
      };

      mockDb.poll.findUnique.mockResolvedValue(pollData);
      mockDb.pollTranslation.findUnique.mockResolvedValue(existingTranslation);

      const request = {
        poll_id: 'poll-123',
        target_languages: ['arabic' as const],
        requested_by: 'user-123',
      };

      const results = await service.requestPollTranslation(request);

      expect(results).toEqual([{
        language: 'arabic',
        status: 'already_exists',
        translation: existingTranslation,
      }]);
      expect(mockTranslationService.translateText).not.toHaveBeenCalled();
    });

    it('should throw error if poll does not exist', async () => {
      mockDb.poll.findUnique.mockResolvedValue(null);

      const request = {
        poll_id: 'non-existent',
        target_languages: ['arabic' as const],
        requested_by: 'user-123',
      };

      await expect(service.requestPollTranslation(request)).rejects.toThrow('Poll not found');
    });
  });

  describe('getPollTranslations', () => {
    it('should return all translations for a poll', async () => {
      const translations = [
        {
          id: 'trans-1',
          poll_id: 'poll-123',
          language: 'arabic',
          question: 'Arabic question',
          created_at: new Date('2025-01-01'),
        },
      ];

      mockDb.pollTranslation.findMany.mockResolvedValue(translations);

      const result = await service.getPollTranslations('poll-123');

      expect(mockDb.pollTranslation.findMany).toHaveBeenCalledWith({
        where: { poll_id: 'poll-123' },
        orderBy: { created_at: 'asc' },
      });
      expect(result).toEqual(translations);
    });
  });

  describe('updatePollTranslation', () => {
    it('should update an existing translation', async () => {
      const existingTranslation = {
        id: 'trans-1',
        poll_id: 'poll-123',
        language: 'arabic',
        question: 'Old question',
      };

      const updates = {
        question: 'New Arabic question',
        description: 'New description',
      };

      const updatedTranslation = {
        ...existingTranslation,
        ...updates,
      };

      mockDb.pollTranslation.findUnique.mockResolvedValue(existingTranslation);
      mockDb.pollTranslation.update.mockResolvedValue(updatedTranslation);

      const result = await service.updatePollTranslation('poll-123', 'arabic', updates);

      expect(mockDb.pollTranslation.update).toHaveBeenCalledWith({
        where: {
          poll_id_language: {
            poll_id: 'poll-123',
            language: 'arabic',
          },
        },
        data: updates,
      });
      expect(result).toEqual(updatedTranslation);
    });

    it('should throw error if translation does not exist', async () => {
      mockDb.pollTranslation.findUnique.mockResolvedValue(null);

      await expect(
        service.updatePollTranslation('poll-123', 'arabic', { question: 'New question' })
      ).rejects.toThrow('Translation not found');
    });
  });

  describe('deletePollTranslation', () => {
    it('should delete an existing translation', async () => {
      const existingTranslation = {
        id: 'trans-1',
        poll_id: 'poll-123',
        language: 'arabic',
      };

      mockDb.pollTranslation.findUnique.mockResolvedValue(existingTranslation);
      mockDb.pollTranslation.delete.mockResolvedValue(existingTranslation);

      const result = await service.deletePollTranslation('poll-123', 'arabic');

      expect(mockDb.pollTranslation.delete).toHaveBeenCalledWith({
        where: {
          poll_id_language: {
            poll_id: 'poll-123',
            language: 'arabic',
          },
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw error if translation does not exist', async () => {
      mockDb.pollTranslation.findUnique.mockResolvedValue(null);

      await expect(
        service.deletePollTranslation('poll-123', 'arabic')
      ).rejects.toThrow('Translation not found');
    });
  });

  describe('getLocalizedPolls', () => {
    it('should return polls with translations when available', async () => {
      const pollsData = [
        {
          id: 'poll-1',
          question: 'Original question 1',
          description: 'Original description 1',
          poll_type: 'single_choice',
          status: 'active',
          is_anonymous: true,
          end_date: null,
          created_at: new Date('2025-01-01'),
          options: [
            { id: 'opt-1', option_text: 'Yes', order_index: 0 },
          ],
          translations: [
            {
              question: 'Translated question 1',
              description: 'Translated description 1',
            },
          ],
          _count: { votes: 5 },
        },
        {
          id: 'poll-2',
          question: 'Original question 2',
          description: null,
          poll_type: 'multiple_choice',
          status: 'active',
          is_anonymous: false,
          end_date: new Date('2025-12-31'),
          created_at: new Date('2025-01-02'),
          options: [],
          translations: [], // No translation
          _count: { votes: 0 },
        },
      ];

      mockDb.poll.findMany.mockResolvedValue(pollsData);

      const result = await service.getLocalizedPolls('arabic');

      expect(result).toHaveLength(2);
      
      // First poll with translation
      expect(result[0]).toEqual({
        id: 'poll-1',
        question: 'Translated question 1',
        description: 'Translated description 1',
        poll_type: 'single_choice',
        status: 'active',
        is_anonymous: true,
        voting_deadline: undefined,
        created_at: new Date('2025-01-01'),
        language: 'arabic',
        options: [
          { id: 'opt-1', option_text: 'Yes', option_order: 0 },
        ],
      });

      // Second poll without translation (fallback)
      expect(result[1]).toEqual({
        id: 'poll-2',
        question: 'Original question 2',
        description: undefined,
        poll_type: 'multiple_choice',
        status: 'active',
        is_anonymous: false,
        voting_deadline: new Date('2025-12-31'),
        created_at: new Date('2025-01-02'),
        language: 'french', // Fallback
        options: [],
      });
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return available languages including default', async () => {
      const translations = [
        { language: 'arabic' },
      ];

      mockDb.pollTranslation.findMany.mockResolvedValue(translations);

      const result = await service.getAvailableLanguages('poll-123');

      expect(result).toEqual(['french', 'arabic']); // French added as default
    });

    it('should not duplicate french if already in translations', async () => {
      const translations = [
        { language: 'french' },
        { language: 'arabic' },
      ];

      mockDb.pollTranslation.findMany.mockResolvedValue(translations);

      const result = await service.getAvailableLanguages('poll-123');

      expect(result).toEqual(['french', 'arabic']);
    });
  });

  describe('hasTranslation', () => {
    it('should return true if translation exists', async () => {
      mockDb.pollTranslation.findUnique.mockResolvedValue({
        id: 'trans-1',
        poll_id: 'poll-123',
        language: 'arabic',
      });

      const result = await service.hasTranslation('poll-123', 'arabic');

      expect(result).toBe(true);
    });

    it('should return false if translation does not exist', async () => {
      mockDb.pollTranslation.findUnique.mockResolvedValue(null);

      const result = await service.hasTranslation('poll-123', 'arabic');

      expect(result).toBe(false);
    });
  });

  describe('getTranslationCompleteness', () => {
    it('should calculate translation completeness correctly', async () => {
      // Mock available languages (french + arabic)
      jest.spyOn(service, 'getAvailableLanguages').mockResolvedValue(['french', 'arabic']);

      const result = await service.getTranslationCompleteness('poll-123');

      expect(result).toEqual({
        total_languages: 2,
        available_languages: 2,
        percentage: 100,
        missing_languages: [],
      });
    });

    it('should handle partial translations', async () => {
      // Mock only french available
      jest.spyOn(service, 'getAvailableLanguages').mockResolvedValue(['french']);

      const result = await service.getTranslationCompleteness('poll-123');

      expect(result).toEqual({
        total_languages: 2,
        available_languages: 1,
        percentage: 50,
        missing_languages: ['arabic'],
      });
    });
  });
});