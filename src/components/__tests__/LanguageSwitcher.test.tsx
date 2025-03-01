import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LanguageSwitcher from '../LanguageSwitcher';

// Mock the useI18n hook
jest.mock('../../lib/i18n/client', () => ({
  useI18n: jest.fn(() => ({
    locale: 'fr',
    setLocale: jest.fn(),
    t: jest.fn((key) => key),
    isLoading: false,
  })),
}));

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dropdown variant correctly', () => {
    const { useI18n } = require('../../lib/i18n/client');
    useI18n.mockReturnValue({
      locale: 'fr',
      setLocale: jest.fn(),
      t: jest.fn((key) => key),
      isLoading: false,
    });

    render(<LanguageSwitcher variant="dropdown" />);
    
    // Should show the current language
    expect(screen.getByText('Français')).toBeInTheDocument();
    
    // Dropdown should be closed initially
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.queryByText('العربية')).not.toBeInTheDocument();
  });

  it('renders the buttons variant correctly', () => {
    const { useI18n } = require('../../lib/i18n/client');
    useI18n.mockReturnValue({
      locale: 'fr',
      setLocale: jest.fn(),
      t: jest.fn((key) => key),
      isLoading: false,
    });

    render(<LanguageSwitcher variant="buttons" />);
    
    // Should show all language buttons
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
    
    // Current language button should be highlighted
    expect(screen.getByText('Français').closest('button')).toHaveClass('bg-primary');
  });

  it('opens the dropdown when clicked', () => {
    const { useI18n } = require('../../lib/i18n/client');
    useI18n.mockReturnValue({
      locale: 'fr',
      setLocale: jest.fn(),
      t: jest.fn((key) => key),
      isLoading: false,
    });

    render(<LanguageSwitcher variant="dropdown" />);
    
    // Click the dropdown button
    fireEvent.click(screen.getByText('Français'));
    
    // Dropdown should be open
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
  });

  it('changes language when a dropdown option is selected', () => {
    const mockSetLocale = jest.fn();
    const { useI18n } = require('../../lib/i18n/client');
    useI18n.mockReturnValue({
      locale: 'fr',
      setLocale: mockSetLocale,
      t: jest.fn((key) => key),
      isLoading: false,
    });

    render(<LanguageSwitcher variant="dropdown" />);
    
    // Open dropdown
    fireEvent.click(screen.getByText('Français'));
    
    // Select English
    fireEvent.click(screen.getByText('English'));
    
    // Should call setLocale with 'en'
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('changes language when a button is clicked', () => {
    const mockSetLocale = jest.fn();
    const { useI18n } = require('../../lib/i18n/client');
    useI18n.mockReturnValue({
      locale: 'fr',
      setLocale: mockSetLocale,
      t: jest.fn((key) => key),
      isLoading: false,
    });

    render(<LanguageSwitcher variant="buttons" />);
    
    // Click English button
    fireEvent.click(screen.getByText('English'));
    
    // Should call setLocale with 'en'
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('handles RTL languages correctly', () => {
    const { useI18n } = require('../../lib/i18n/client');
    useI18n.mockReturnValue({
      locale: 'ar',
      setLocale: jest.fn(),
      t: jest.fn((key) => key),
      isLoading: false,
    });

    render(<LanguageSwitcher variant="dropdown" />);
    
    // Should show Arabic as current language
    expect(screen.getByText('العربية')).toBeInTheDocument();
    
    // Open dropdown
    fireEvent.click(screen.getByText('العربية'));
    
    // Dropdown should have RTL-specific styling
    const dropdown = screen.getByRole('menu');
    expect(dropdown).toHaveClass('right-0');
  });

  it('closes the dropdown when clicking outside', () => {
    const { useI18n } = require('../../lib/i18n/client');
    useI18n.mockReturnValue({
      locale: 'fr',
      setLocale: jest.fn(),
      t: jest.fn((key) => key),
      isLoading: false,
    });

    render(
      <div>
        <div data-testid="outside">Outside</div>
        <LanguageSwitcher variant="dropdown" />
      </div>
    );
    
    // Open dropdown
    fireEvent.click(screen.getByText('Français'));
    
    // Dropdown should be open
    expect(screen.getByText('English')).toBeInTheDocument();
    
    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));
    
    // Dropdown should be closed
    expect(screen.queryByText('English')).not.toBeInTheDocument();
  });
}); 