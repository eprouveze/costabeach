import { loadTranslations, getTranslation, formatDate, formatNumber } from '../utils';
import { Locale } from '../config';

// Mock dynamic import for loadTranslations
jest.mock('../utils', () => {
  const originalModule = jest.requireActual('../utils');
  return {
    ...originalModule,
    loadTranslations: jest.fn().mockImplementation((locale) => {
      return Promise.resolve({
        hello: 'Hello',
        welcome: 'Welcome'
      });
    })
  };
});

describe('i18n utils', () => {
  describe('loadTranslations', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('loads translations for a valid locale', async () => {
      const translations = await loadTranslations('en' as Locale);
      
      expect(loadTranslations).toHaveBeenCalledWith('en');
      expect(translations).toEqual({ hello: 'Hello', welcome: 'Welcome' });
    });

    it('handles fetch errors gracefully', async () => {
      (loadTranslations as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      try {
        await loadTranslations('en' as Locale);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getTranslation', () => {
    it('returns the translation if it exists', () => {
      const translations = { hello: 'Hello', welcome: 'Welcome' };
      
      const result = getTranslation(translations, 'hello');
      
      expect(result).toBe('Hello');
    });

    it('returns the key if translation does not exist', () => {
      const translations = { hello: 'Hello' };
      
      const result = getTranslation(translations, 'missing');
      
      expect(result).toBe('missing');
    });

    it('handles nested keys with dot notation', () => {
      const translations = { 
        common: { 
          hello: 'Hello',
          welcome: 'Welcome' 
        } 
      };
      
      const result = getTranslation(translations, 'common.hello');
      
      expect(result).toBe('Hello');
    });

    it('returns the key if nested path is invalid', () => {
      const translations = { common: { hello: 'Hello' } };
      
      const result = getTranslation(translations, 'common.missing');
      
      expect(result).toBe('common.missing');
    });
  });

  describe('formatDate', () => {
    const originalIntl = global.Intl;
    
    beforeEach(() => {
      // Save original Intl
      global.Intl = { ...originalIntl };
      
      // Mock DateTimeFormat
      global.Intl.DateTimeFormat = jest.fn().mockImplementation((locale) => ({
        format: () => `Formatted date in ${locale}`,
      })) as any;
      
      // Add supportedLocalesOf to the mock
      global.Intl.DateTimeFormat.supportedLocalesOf = jest.fn().mockImplementation((locales) => {
        if (locales.includes('fr')) return ['fr'];
        return [];
      });
    });
    
    afterEach(() => {
      // Restore original Intl
      global.Intl = originalIntl;
    });

    it('formats date with the specified locale', () => {
      const date = new Date('2023-01-01');
      
      const result = formatDate(date, 'fr' as Locale);
      
      expect(global.Intl.DateTimeFormat).toHaveBeenCalledWith('fr', expect.any(Object));
      expect(result).toBe('Formatted date in fr');
    });

    it('uses default formatting options', () => {
      const date = new Date('2023-01-01');
      
      formatDate(date, 'en' as Locale);
      
      expect(global.Intl.DateTimeFormat).toHaveBeenCalledWith('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });
  });

  describe('formatNumber', () => {
    const originalIntl = global.Intl;
    
    beforeEach(() => {
      // Save original Intl
      global.Intl = { ...originalIntl };
      
      // Mock NumberFormat
      global.Intl.NumberFormat = jest.fn().mockImplementation((locale) => ({
        format: () => `Formatted number in ${locale}`,
      })) as any;
      
      // Add supportedLocalesOf to the mock
      global.Intl.NumberFormat.supportedLocalesOf = jest.fn().mockImplementation((locales) => {
        if (locales.includes('fr')) return ['fr'];
        return [];
      });
    });
    
    afterEach(() => {
      // Restore original Intl
      global.Intl = originalIntl;
    });

    it('formats number with the specified locale', () => {
      const result = formatNumber(1000, 'fr' as Locale);
      
      expect(result).toBe('Formatted number in fr');
    });
  });
}); 