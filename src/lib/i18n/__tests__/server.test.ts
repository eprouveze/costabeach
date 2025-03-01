import { getLocale, useTranslation } from '../server';
import * as utils from '../utils';
import { defaultLocale } from '../config';
import { cookies, headers } from 'next/headers';

// Mock the Next.js cookies and headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn(),
}));

// Mock the utils functions
jest.mock('../utils', () => ({
  loadTranslations: jest.fn(),
  getTranslation: jest.fn(),
  formatDate: jest.fn(),
  formatNumber: jest.fn(),
}));

describe('i18n server', () => {
  describe('getLocale', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return locale from cookies if available', async () => {
      // Mock cookies
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'fr' }),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      const locale = await getLocale();
      
      expect(locale).toBe('fr');
      expect(mockCookieStore.get).toHaveBeenCalledWith('NEXT_LOCALE');
      expect(headers).not.toHaveBeenCalled();
    });

    it('should fall back to Accept-Language header if no cookie', async () => {
      // Mock cookies with no locale
      const mockCookieStore = {
        get: jest.fn().mockReturnValue(null),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);
      
      // Mock headers with fr locale
      const mockHeadersList = {
        get: jest.fn().mockReturnValue('fr,en-US;q=0.9,en;q=0.8'),
      };
      (headers as jest.Mock).mockReturnValue(mockHeadersList);

      const locale = await getLocale();
      
      expect(locale).toBe('fr');
      expect(mockCookieStore.get).toHaveBeenCalledWith('NEXT_LOCALE');
      expect(mockHeadersList.get).toHaveBeenCalledWith('Accept-Language');
    });

    it('should return default locale if no cookie or valid header', async () => {
      // Mock cookies with no locale
      const mockCookieStore = {
        get: jest.fn().mockReturnValue(null),
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);
      
      // Mock headers with unsupported locale
      const mockHeadersList = {
        get: jest.fn().mockReturnValue('de,es;q=0.9'),
      };
      (headers as jest.Mock).mockReturnValue(mockHeadersList);

      const locale = await getLocale();
      
      expect(locale).toBe(defaultLocale);
      expect(mockCookieStore.get).toHaveBeenCalledWith('NEXT_LOCALE');
      expect(mockHeadersList.get).toHaveBeenCalledWith('Accept-Language');
    });
  });

  describe('useTranslation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should use provided locale if specified', async () => {
      const mockTranslations = { common: { welcome: 'Bienvenue' } };
      (utils.loadTranslations as jest.Mock).mockResolvedValue(mockTranslations);
      
      const translation = await useTranslation('fr');
      
      expect(utils.loadTranslations).toHaveBeenCalledWith('fr');
      expect(translation.locale).toBe('fr');
    });

    it('should get locale from request if none provided', async () => {
      // Mock getLocale to return 'fr'
      const mockGetLocale = jest.spyOn(require('../server'), 'getLocale');
      mockGetLocale.mockResolvedValue('fr');
      
      const mockTranslations = { common: { welcome: 'Bienvenue' } };
      (utils.loadTranslations as jest.Mock).mockResolvedValue(mockTranslations);
      
      const translation = await useTranslation();
      
      expect(mockGetLocale).toHaveBeenCalled();
      expect(utils.loadTranslations).toHaveBeenCalledWith('fr');
      expect(translation.locale).toBe('fr');
    });

    it('should set isRTL to true for Arabic locale', async () => {
      const mockTranslations = { common: { welcome: 'مرحبا' } };
      (utils.loadTranslations as jest.Mock).mockResolvedValue(mockTranslations);
      
      const translation = await useTranslation('ar');
      
      expect(translation.isRTL).toBe(true);
    });

    it('should set isRTL to false for non-Arabic locales', async () => {
      const mockTranslations = { common: { welcome: 'Bienvenue' } };
      (utils.loadTranslations as jest.Mock).mockResolvedValue(mockTranslations);
      
      const translation = await useTranslation('fr');
      
      expect(translation.isRTL).toBe(false);
    });

    it('should provide t function that uses getTranslation', async () => {
      const mockTranslations = { common: { welcome: 'Bienvenue' } };
      (utils.loadTranslations as jest.Mock).mockResolvedValue(mockTranslations);
      (utils.getTranslation as jest.Mock).mockReturnValue('Bienvenue');
      
      const translation = await useTranslation('fr');
      translation.t('common.welcome');
      
      expect(utils.getTranslation).toHaveBeenCalledWith(mockTranslations, 'common.welcome');
    });
  });
}); 