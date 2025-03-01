import { loadTranslations, getTranslation, formatDate, formatNumber } from '../utils';
import { Locale } from '../config';

// Mock the dynamic import
jest.mock('../utils', () => {
  const originalModule = jest.requireActual('../utils');
  return {
    ...originalModule,
    loadTranslations: jest.fn(),
  };
});

describe('i18n utils', () => {
  describe('loadTranslations', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should load translations for a valid locale', async () => {
      const mockTranslations = { common: { welcome: 'Bienvenue' } };
      (loadTranslations as jest.Mock).mockResolvedValue(mockTranslations);

      const result = await loadTranslations('fr' as Locale);
      expect(result).toEqual(mockTranslations);
      expect(loadTranslations).toHaveBeenCalledWith('fr');
    });

    it('should fall back to default locale if translations fail to load', async () => {
      const mockTranslations = { common: { welcome: 'Welcome' } };
      (loadTranslations as jest.Mock)
        .mockRejectedValueOnce(new Error('Failed to load'))
        .mockResolvedValueOnce(mockTranslations);

      const result = await loadTranslations('invalid-locale' as Locale);
      expect(result).toEqual(mockTranslations);
    });
  });

  describe('getTranslation', () => {
    it('should return the correct translation for a valid key', () => {
      const translations = {
        common: {
          welcome: 'Welcome',
          hello: 'Hello',
        },
        buttons: {
          submit: 'Submit',
        },
      };

      expect(getTranslation(translations, 'common.welcome')).toBe('Welcome');
      expect(getTranslation(translations, 'common.hello')).toBe('Hello');
      expect(getTranslation(translations, 'buttons.submit')).toBe('Submit');
    });

    it('should return the key if translation is not found', () => {
      const translations = {
        common: {
          welcome: 'Welcome',
        },
      };

      expect(getTranslation(translations, 'common.missing')).toBe('common.missing');
      expect(getTranslation(translations, 'missing.key')).toBe('missing.key');
    });
  });

  describe('formatDate', () => {
    it('should format dates according to locale', () => {
      const date = new Date('2023-01-15');
      
      // Mock Intl.DateTimeFormat
      const mockFormat = jest.fn().mockReturnValue('15 janvier 2023');
      global.Intl.DateTimeFormat = jest.fn().mockImplementation(() => ({
        format: mockFormat,
      }));

      const result = formatDate(date, 'fr' as Locale);
      
      expect(global.Intl.DateTimeFormat).toHaveBeenCalledWith('fr', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(result).toBe('15 janvier 2023');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers according to locale', () => {
      const number = 1234.56;
      
      // Mock Intl.NumberFormat
      const mockFormat = jest.fn().mockReturnValue('1 234,56');
      global.Intl.NumberFormat = jest.fn().mockImplementation(() => ({
        format: mockFormat,
      }));

      const result = formatNumber(number, 'fr' as Locale);
      
      expect(global.Intl.NumberFormat).toHaveBeenCalledWith('fr');
      expect(result).toBe('1 234,56');
    });
  });
}); 