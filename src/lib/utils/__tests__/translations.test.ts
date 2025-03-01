import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { translateText, getCachedTranslation, cacheTranslation } from '../translations';
import { Language } from '@/lib/types';
import * as aiClient from '@/lib/aiClient';

// Mock the AI client
jest.mock('@/lib/aiClient', () => ({
  generateChatCompletion: jest.fn(),
}));

describe('Translation Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('translateText', () => {
    it('should translate text using OpenAI', async () => {
      // Mock the AI response
      jest.mocked(aiClient.generateChatCompletion).mockResolvedValue('Bonjour le monde');
      
      const result = await translateText(
        'Hello world',
        Language.ENGLISH,
        Language.FRENCH
      );
      
      expect(result).toBe('Bonjour le monde');
      expect(aiClient.generateChatCompletion).toHaveBeenCalledTimes(1);
      expect(aiClient.generateChatCompletion).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Hello world'),
          }),
        ]),
        'O1',
        expect.objectContaining({ temperature: 0.3 })
      );
    });
    
    it('should use cached translation if available', async () => {
      // Pre-cache a translation
      cacheTranslation(
        'Hello world',
        Language.FRENCH,
        'Bonjour le monde'
      );
      
      const result = await translateText(
        'Hello world',
        Language.ENGLISH,
        Language.FRENCH
      );
      
      expect(result).toBe('Bonjour le monde');
      expect(aiClient.generateChatCompletion).not.toHaveBeenCalled();
    });
    
    it('should handle errors from the AI client', async () => {
      // Clear any cached translations first
      cacheTranslation('Hello world', Language.FRENCH, '');
      
      // Mock the AI response to throw an error
      jest.mocked(aiClient.generateChatCompletion).mockRejectedValueOnce(
        new Error('API error')
      );
      
      await expect(
        translateText('Hello world', Language.ENGLISH, Language.FRENCH)
      ).rejects.toThrow('Failed to translate text: API error');
    });
  });
  
  describe('getCachedTranslation', () => {
    it('should return null for non-cached translations', () => {
      const result = getCachedTranslation('Not cached', Language.FRENCH);
      expect(result).toBeNull();
    });
    
    it('should return cached translation if available', () => {
      cacheTranslation('Test text', Language.FRENCH, 'Texte de test');
      
      const result = getCachedTranslation('Test text', Language.FRENCH);
      expect(result).toBe('Texte de test');
    });
  });
  
  describe('cacheTranslation', () => {
    it('should cache a translation result', () => {
      cacheTranslation('Cache me', Language.ARABIC, 'Cached text');
      
      const result = getCachedTranslation('Cache me', Language.ARABIC);
      expect(result).toBe('Cached text');
    });
    
    it('should handle long texts by truncating the cache key', () => {
      const longText = 'A'.repeat(200);
      cacheTranslation(longText, Language.FRENCH, 'Texte long');
      
      const result = getCachedTranslation(longText, Language.FRENCH);
      expect(result).toBe('Texte long');
    });
  });
}); 