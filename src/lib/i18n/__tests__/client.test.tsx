import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nProvider, useI18n } from '../client';
import { loadTranslations } from '../utils';
import { Locale } from '../config';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock loadTranslations function
jest.mock('../utils', () => ({
  loadTranslations: jest.fn((locale) => 
    Promise.resolve({
      'common.hello': locale === 'fr' ? 'Bonjour' : 'Hello',
      'common.welcome': locale === 'fr' ? 'Bienvenue' : 'Welcome',
    })
  ),
}));

// Test component that uses the useI18n hook
const TestComponent = ({ onLocaleChange }: { onLocaleChange?: (locale: Locale) => void }) => {
  const { locale, setLocale, t, isLoading } = useI18n();
  
  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="direction">{locale === 'ar' ? 'rtl' : 'ltr'}</div>
      <div data-testid="translation">{t('common.hello')}</div>
      {isLoading && <div data-testid="loading">Loading...</div>}
      <button 
        data-testid="change-locale" 
        onClick={() => {
          setLocale('ar');
          if (onLocaleChange) onLocaleChange('ar');
        }}
      >
        Change to Arabic
      </button>
    </div>
  );
};

describe('I18nProvider and useI18n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('should provide default locale when no locale in pathname', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('should set loading state while translations are loading', async () => {
    (loadTranslations as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({}), 100))
    );

    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should translate text using the t function', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    expect(screen.getByTestId('translation')).toHaveTextContent('Hello');
  });

  it('should change locale when setLocale is called', async () => {
    const mockOnLocaleChange = jest.fn();
    const mockRouter = { push: jest.fn() };
    require('next/navigation').useRouter.mockReturnValue(mockRouter);

    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent onLocaleChange={mockOnLocaleChange} />
        </I18nProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('change-locale'));
    });

    expect(mockOnLocaleChange).toHaveBeenCalledWith('ar');
    expect(mockRouter.push).toHaveBeenCalled();
  });

  it('should throw error when useI18n is used outside I18nProvider', () => {
    const consoleError = console.error;
    console.error = jest.fn(); // Suppress error logs

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useI18n must be used within an I18nProvider');

    console.error = consoleError; // Restore console.error
  });
}); 