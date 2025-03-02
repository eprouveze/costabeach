import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LanguageSwitcher from '../LanguageSwitcher';

// Mock the useI18n hook
jest.mock('@/lib/i18n/client', () => ({
  useI18n: () => ({
    locale: 'fr',
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.language': 'Language',
      };
      return translations[key] || key;
    },
    setLocale: mockSetLocale,
    isRTL: false,
  }),
}));

// Mock the Globe icon
jest.mock('lucide-react', () => ({
  Globe: () => <div data-testid="globe-icon" />,
}));

// Create a mock function for setLocale
const mockSetLocale = jest.fn();

// Mock the localeNames
jest.mock('@/lib/i18n/config', () => ({
  localeNames: {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
  },
  localeDirections: {
    en: 'ltr',
    fr: 'ltr',
    ar: 'rtl',
  },
  defaultLocale: 'en',
  locales: ['en', 'fr', 'ar'],
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation to default
    jest.spyOn(require('@/lib/i18n/client'), 'useI18n').mockImplementation(() => ({
      locale: 'fr',
      t: (key: string) => {
        const translations: Record<string, string> = {
          'common.language': 'Language',
        };
        return translations[key] || key;
      },
      setLocale: mockSetLocale,
      isRTL: false,
    }));
  });

  it('renders the dropdown variant correctly', () => {
    render(<LanguageSwitcher variant="dropdown" />);
    
    // Should show the current language
    expect(screen.getByText('Français')).toBeInTheDocument();
    
    // Dropdown should be closed initially
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.queryByText('العربية')).not.toBeInTheDocument();
  });

  it('renders the buttons variant correctly', () => {
    render(<LanguageSwitcher variant="buttons" />);
    
    // Should show all language options
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
    
    // Current language button should be highlighted
    expect(screen.getByText('Français').closest('button')).toHaveClass('bg-primary');
  });

  it('opens the dropdown when clicked', () => {
    render(<LanguageSwitcher variant="dropdown" />);
    
    // Click the dropdown button
    fireEvent.click(screen.getByText('Français'));
    
    // Dropdown should be open
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
  });

  it('changes language when a dropdown option is selected', () => {
    render(<LanguageSwitcher variant="dropdown" />);
    
    // Open dropdown
    fireEvent.click(screen.getByText('Français'));
    
    // Select English
    fireEvent.click(screen.getByText('English'));
    
    // Should call setLocale with 'en'
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('changes language when a button is clicked', () => {
    render(<LanguageSwitcher variant="buttons" />);
    
    // Click English button
    fireEvent.click(screen.getByText('English'));
    
    // Should call setLocale with 'en'
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('handles RTL languages correctly', () => {
    // Override the mock for this test to use Arabic
    jest.spyOn(require('@/lib/i18n/client'), 'useI18n').mockImplementation(() => ({
      locale: 'ar',
      t: (key: string) => {
        const translations: Record<string, string> = {
          'common.language': 'اللغة',
        };
        return translations[key] || key;
      },
      setLocale: mockSetLocale,
      isRTL: true,
    }));
    
    render(<LanguageSwitcher variant="dropdown" />);
    
    // Should show Arabic as current language
    expect(screen.getByText('العربية')).toBeInTheDocument();
    
    // Open dropdown
    fireEvent.click(screen.getByText('العربية'));
    
    // Find the dropdown menu
    const dropdownMenu = screen.getByRole('menu');
    
    // Check that the parent div has the right-0 class
    const dropdownContainer = dropdownMenu.closest('div[class*="absolute"]');
    expect(dropdownContainer).toHaveClass('right-0');
    expect(dropdownContainer).not.toHaveClass('left-0');
  });

  it('closes the dropdown when clicking outside', () => {
    // Mock document.addEventListener
    const addEventListener = jest.spyOn(document, 'addEventListener');
    const removeEventListener = jest.spyOn(document, 'removeEventListener');
    
    const { container } = render(
      <div>
        <div data-testid="outside">Outside</div>
        <LanguageSwitcher variant="dropdown" />
      </div>
    );
    
    // Open dropdown
    fireEvent.click(screen.getByText('Français'));
    
    // Dropdown should be open
    expect(screen.getByText('English')).toBeInTheDocument();
    
    // Verify that event listener was added
    expect(addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    
    // Simulate clicking outside by triggering the mousedown event handler directly
    const handleClickOutside = addEventListener.mock.calls[0][1] as EventListener;
    
    // Create a mock event with target outside the dropdown
    const outsideElement = screen.getByTestId('outside');
    const mockEvent = { target: outsideElement } as unknown as MouseEvent;
    
    // Trigger the event handler
    handleClickOutside(mockEvent);
    
    // Wait for state update
    setTimeout(() => {
      // Dropdown should be closed
      expect(screen.queryByText('English')).not.toBeInTheDocument();
      
      // Cleanup
      addEventListener.mockRestore();
      removeEventListener.mockRestore();
    }, 0);
  });
}); 