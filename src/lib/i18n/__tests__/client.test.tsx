import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nProvider, useI18n } from '../client';
import { loadTranslations } from '../utils';
import { defaultLocale } from '../config';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

// Mock utils
jest.mock('../utils', () => ({
  loadTranslations: jest.fn(),
}));

// Test component that uses the useI18n hook
const TestComponent = () => {
  const { locale, t, setLocale, isLoading } = useI18n();
  
  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="translation">{t('common.welcome')}</div>
      <button data-testid="change-locale" onClick={() => setLocale('ar')}>
        Change to Arabic
      </button>
    </div>
  );
};

describe('I18nProvider and useI18n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should provide default locale when no locale in pathname', async () => {
    // Mock loadTranslations to resolve immediately
    (loadTranslations as jest.Mock).mockResolvedValue({ common: { welcome: 'Welcome' } });
    
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });
    
    expect(screen.getByTestId('locale').textContent).toBe(defaultLocale);
  });
  
  it('should set loading state while translations are loading', async () => {
    // Create a promise that we can resolve later
    let resolveTranslations: (value: any) => void;
    const translationsPromise = new Promise((resolve) => {
      resolveTranslations = resolve;
    });
    
    (loadTranslations as jest.Mock).mockReturnValue(translationsPromise);
    
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });
    
    // Should be loading initially
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Resolve translations
    await act(async () => {
      resolveTranslations!({ common: { welcome: 'Welcome' } });
    });
    
    // Should no longer be loading
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });
  
  it('should translate text using the t function', async () => {
    (loadTranslations as jest.Mock).mockResolvedValue({ common: { welcome: 'Welcome' } });
    
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });
    
    expect(screen.getByTestId('translation').textContent).toBe('Welcome');
  });
  
  it('should change locale when setLocale is called', async () => {
    const { useRouter, usePathname } = require('next/navigation');
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });
    usePathname.mockReturnValue('/documents');
    
    (loadTranslations as jest.Mock)
      .mockResolvedValueOnce({ common: { welcome: 'Welcome' } })
      .mockResolvedValueOnce({ common: { welcome: 'مرحبا' } });
    
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });
    
    // Change locale to Arabic
    await act(async () => {
      fireEvent.click(screen.getByTestId('change-locale'));
    });
    
    // Should update the URL
    expect(mockPush).toHaveBeenCalledWith('/ar/documents');
    
    // Should load new translations
    expect(loadTranslations).toHaveBeenCalledWith('ar');
  });
  
  it('should throw error when useI18n is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useI18n must be used within an I18nProvider');
    
    // Restore console.error
    console.error = originalError;
  });
}); 