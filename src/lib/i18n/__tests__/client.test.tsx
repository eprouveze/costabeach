/** @jest-environment jsdom */

import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePathname, useRouter } from 'next/navigation';
import { I18nProvider, useI18n } from '../client';
import { loadTranslations } from '../utils';
import { Locale, defaultLocale } from '../config';
import { act } from 'react-dom/test-utils';

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  usePathname: () => '/test',
}));

// Mock the loadTranslations function
jest.mock('../utils', () => ({
  loadTranslations: jest.fn(),
}));

// Create mock functions
const mockPush = jest.fn();

// Mock translations
const mockTranslations: Record<string, any> = {
  en: {
    common: {
      hello: 'Hello',
    },
  },
  fr: {
    common: {
      hello: 'Bonjour',
    },
  },
  ar: {
    common: {
      hello: 'مرحبا',
    },
  },
};

// Setup the loadTranslations mock
beforeEach(() => {
  jest.clearAllMocks();
  (loadTranslations as jest.Mock).mockImplementation((locale: string, namespace?: string) => {
    return Promise.resolve(mockTranslations[locale] || {});
  });
});

// Test component
const TestComponent = () => {
  const { locale, setLocale, t, isLoading } = useI18n();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="direction">{direction}</div>
      <div data-testid="translation">{t('common.hello')}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <button 
        data-testid="change-locale" 
        onClick={() => setLocale('fr')}
      >
        Change to French
      </button>
    </div>
  );
};

// Arabic test component
const ArabicTestComponent = () => {
  const { locale, setLocale, t, isLoading } = useI18n();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  // Set locale to Arabic on mount
  React.useEffect(() => {
    setLocale('ar');
  }, [setLocale]);
  
  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="direction">{direction}</div>
      <div data-testid="translation">{t('common.hello')}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
    </div>
  );
};

// English test component for locale change test
const EnglishTestComponent = () => {
  const { locale, setLocale, t, isLoading } = useI18n();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  // Set locale to English on mount
  React.useEffect(() => {
    // Only set locale if it's not already English
    if (locale !== 'en') {
      setLocale('en');
    }
  }, [locale, setLocale]);
  
  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="direction">{direction}</div>
      <div data-testid="translation">{t('common.hello')}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <button 
        data-testid="change-locale" 
        onClick={() => setLocale('fr')}
      >
        Change to French
      </button>
    </div>
  );
};

// Missing translation component
const MissingTranslationComponent = () => {
  const { t } = useI18n();
  return <div data-testid="missing-translation">{t('common.missing')}</div>;
};

describe('I18nProvider', () => {
  it('provides default locale', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    
    // Wait for translations to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    }, { timeout: 3000 });
    
    // Check that the default locale is used (fr)
    expect(screen.getByTestId('locale')).toHaveTextContent(defaultLocale);
  });
  
  it('sets direction based on locale', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    
    // Wait for translations to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    }, { timeout: 3000 });
    
    // French is ltr
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr');
  });
  
  it('handles Arabic locale correctly', async () => {
    render(
      <I18nProvider>
        <ArabicTestComponent />
      </I18nProvider>
    );
    
    // Wait for translations to load and locale to change
    await waitFor(() => {
      expect(screen.getByTestId('locale')).toHaveTextContent('ar');
    }, { timeout: 3000 });
    
    // Check that direction is rtl for Arabic
    await waitFor(() => {
      expect(screen.getByTestId('direction')).toHaveTextContent('rtl');
    }, { timeout: 3000 });
  });
  
  it('translates text correctly', async () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );
    
    // Wait for translations to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    }, { timeout: 3000 });
    
    // Check that the translation is correct for French (default locale)
    expect(screen.getByTestId('translation')).toHaveTextContent('Bonjour');
  });
  
  it('returns key if translation is not found', async () => {
    render(
      <I18nProvider>
        <MissingTranslationComponent />
      </I18nProvider>
    );
    
    // Wait for translations to load
    await waitFor(() => {
      expect(screen.getByTestId('missing-translation')).toHaveTextContent('common.missing');
    }, { timeout: 3000 });
  });
  
  it('changes locale when setLocale is called', async () => {
    // Reset mockPush before this test
    mockPush.mockClear();
    
    // Mock the router.push to simulate the URL change and trigger the useEffect
    mockPush.mockImplementation((url: string) => {
      // Simulate the URL change
      jest.spyOn(window, 'location', 'get').mockReturnValue({
        ...window.location,
        search: url.includes('?') ? url.split('?')[1] : '',
      });
    });
    
    render(
      <I18nProvider>
        <EnglishTestComponent />
      </I18nProvider>
    );
    
    // Wait for initial translations to load and locale to be set to English
    await waitFor(() => {
      expect(screen.getByTestId('locale')).toHaveTextContent('en');
    }, { timeout: 3000 });
    
    // Ensure loading is complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    }, { timeout: 3000 });
    
    // Click the button to change locale to French
    act(() => {
      fireEvent.click(screen.getByTestId('change-locale'));
    });
    
    // Verify that the router.push was called with the correct path format
    // The client.tsx implementation uses segments[1] = newLocale, which results in /fr/test
    expect(mockPush).toHaveBeenCalledWith('/fr/test');
    
    // Since we're mocking the URL change, we need to manually trigger the loadTranslations for French
    act(() => {
      (loadTranslations as jest.Mock).mockImplementation(() => Promise.resolve(mockTranslations.fr));
    });
  });
}); 