import { getLocale, useTranslation } from '../server';
import { loadTranslations, getTranslation, formatDate, formatNumber } from '../utils';
import { defaultLocale } from '../config';
import { cookies, headers } from 'next/headers';

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name) => {
      if (name === 'NEXT_LOCALE' && mockCookieLocale) {
        return { value: mockCookieLocale };
      }
      return undefined;
    }),
  })),
  headers: jest.fn(() => ({
    get: jest.fn((name) => {
      if (name === 'Accept-Language' && mockAcceptLanguage) {
        return mockAcceptLanguage;
      }
      return undefined;
    }),
  })),
}));

// Mock utils functions
jest.mock('../utils', () => ({
  loadTranslations: jest.fn((locale) => Promise.resolve({ hello: `Hello in ${locale}` })),
  getTranslation: jest.fn((translations, key) => translations[key] || key),
  formatDate: jest.fn((date, locale) => `Formatted date in ${locale}`),
  formatNumber: jest.fn((number, locale) => `Formatted number in ${locale}`),
}));

// Mock variables for testing
let mockCookieLocale: string | null = null;
let mockAcceptLanguage: string | null = null;

describe('getLocale', () => {
  beforeEach(() => {
    mockCookieLocale = null;
    mockAcceptLanguage = null;
    jest.clearAllMocks();
  });

  it('returns locale from cookies if available', async () => {
    mockCookieLocale = 'fr';
    
    const result = await getLocale();
    
    expect(cookies).toHaveBeenCalled();
    expect(result).toBe('fr');
  });

  it('falls back to Accept-Language header if no cookie', async () => {
    mockAcceptLanguage = 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7';
    
    const result = await getLocale();
    
    expect(cookies).toHaveBeenCalled();
    expect(headers).toHaveBeenCalled();
    expect(result).toBe('fr');
  });

  it('returns default locale if no cookie or valid header', async () => {
    mockAcceptLanguage = 'invalid-locale';
    
    const result = await getLocale();
    
    expect(result).toBe(defaultLocale);
  });
});

describe('useTranslation', () => {
  beforeEach(() => {
    mockCookieLocale = 'fr';
    jest.clearAllMocks();
  });

  it('uses provided locale if specified', async () => {
    const { t, locale, isRTL } = await useTranslation('ar');
    
    expect(locale).toBe('ar');
    expect(loadTranslations).toHaveBeenCalledWith('ar', 'common');
  });

  it('gets locale from request if none provided', async () => {
    const { t, locale, isRTL } = await useTranslation();
    
    expect(locale).toBe('fr');
    expect(loadTranslations).toHaveBeenCalledWith('fr', 'common');
  });

  it('sets isRTL to true for Arabic locale', async () => {
    const { isRTL } = await useTranslation('ar');
    
    expect(isRTL).toBe(true);
  });

  it('sets isRTL to false for non-Arabic locales', async () => {
    const { isRTL } = await useTranslation('fr');
    
    expect(isRTL).toBe(false);
  });

  it('provides a translation function that returns correct translations', async () => {
    // Mock the loadTranslations to return a specific object we can test against
    (loadTranslations as jest.Mock).mockResolvedValueOnce({ hello: 'Hello in fr' });
    
    const { t } = await useTranslation('fr');
    
    // Call the translation function
    const result = t('hello');
    
    // Verify that the translation function returns the correct value
    expect(result).toBe('Hello in fr');
  });
}); 