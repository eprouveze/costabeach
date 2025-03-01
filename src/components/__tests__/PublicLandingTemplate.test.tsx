/**
 * @jest-environment jsdom
 * @jsxRuntime classic
 * @jsx React.createElement
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import PublicLandingTemplate from '../templates/PublicLandingTemplate';

// Mock the useI18n hook
jest.mock('../../lib/i18n/client', () => ({
  useI18n: jest.fn(() => ({
    locale: 'en',
    setLocale: jest.fn(),
    t: (key: string) => {
      // Mock translations for testing
      const translations: Record<string, string> = {
        'common.contact': 'Contact',
        'auth.signIn': 'Sign In',
        'landing.heroTitle': 'Costa Beach 3 Homeowners Association Portal',
        'landing.heroSubtitle': 'Access important documents, community information, and HOA resources in one secure place.',
        'landing.registerCTA': 'Register as Owner',
        'landing.contactCTA': 'Contact Us',
        'landing.featuresTitle': 'Portal Features',
        'landing.features.documents.title': 'Document Access',
        'landing.features.documents.description': 'Access all HOA documents, meeting minutes, and legal information in one secure location.',
        'landing.features.community.title': 'Community Information',
        'landing.features.community.description': 'Stay informed about community events, rules, and important announcements.',
        'landing.features.notifications.title': 'Important Notifications',
        'landing.features.notifications.description': 'Receive timely notifications about maintenance, meetings, and other important updates.',
        'landing.features.information.title': 'Multilingual Support',
        'landing.features.information.description': 'Access all information in your preferred language with our multilingual support.',
        'landing.aboutTitle': 'About Costa Beach 3',
        'landing.aboutDescription1': 'Costa Beach 3 is a premier residential community located in Casablanca, Morocco.',
        'landing.aboutDescription2': 'As a homeowner, you\'ll have access to meeting minutes, financial reports, maintenance schedules, and other important community information.',
        'landing.learnMoreCTA': 'Learn More',
        'landing.footer.description': 'The official homeowners association portal for Costa Beach 3 residential community.',
        'landing.footer.quickLinks': 'Quick Links',
        'landing.footer.contact': 'Contact Information',
        'landing.footer.copyright': 'All rights reserved.',
        'common.home': 'Home'
      };
      return translations[key] || key;
    },
    isLoading: false,
  })),
}));

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return React.createElement('a', { href, 'data-testid': `link-to-${href}` }, children);
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  FileText: () => React.createElement('div', { 'data-testid': 'icon-file-text' }),
  Users: () => React.createElement('div', { 'data-testid': 'icon-users' }),
  Bell: () => React.createElement('div', { 'data-testid': 'icon-bell' }),
  Info: () => React.createElement('div', { 'data-testid': 'icon-info' }),
  Globe: () => React.createElement('div', { 'data-testid': 'icon-globe' }),
}));

// Mock window.matchMedia for responsive design tests
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() { return true; }
  };
};

// Mock LanguageSwitcher component
jest.mock('../../components/LanguageSwitcher', () => {
  return function MockLanguageSwitcher({ variant }: { variant: string }) {
    return React.createElement('div', { 'data-testid': `language-switcher-${variant}` }, 'Language Switcher');
  };
});

describe('PublicLandingTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(React.createElement(PublicLandingTemplate));
    
    // Check if the header is rendered
    expect(screen.getByText('Costa Beach 3')).toBeInTheDocument();
    
    // Check if navigation links are rendered
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    
    // Check if hero section is rendered
    expect(screen.getByText('Costa Beach 3 Homeowners Association Portal')).toBeInTheDocument();
    expect(screen.getByText('Access important documents, community information, and HOA resources in one secure place.')).toBeInTheDocument();
    
    // Check if CTA buttons are rendered
    expect(screen.getByText('Register as Owner')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    
    // Check if features section is rendered
    expect(screen.getByText('Portal Features')).toBeInTheDocument();
    expect(screen.getByText('Document Access')).toBeInTheDocument();
    expect(screen.getByText('Community Information')).toBeInTheDocument();
    expect(screen.getByText('Important Notifications')).toBeInTheDocument();
    expect(screen.getByText('Multilingual Support')).toBeInTheDocument();
    
    // Check if about section is rendered
    expect(screen.getByText('About Costa Beach 3')).toBeInTheDocument();
    
    // Check if footer is rendered
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });

  it('renders the language switcher component', () => {
    render(React.createElement(PublicLandingTemplate));
    
    // Check if language switcher is rendered
    expect(screen.getByTestId('language-switcher-dropdown')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(React.createElement(PublicLandingTemplate));
    
    // Check if links have correct hrefs
    expect(screen.getByTestId('link-to-/')).toBeInTheDocument();
    expect(screen.getByTestId('link-to-/contact')).toBeInTheDocument();
    expect(screen.getByTestId('link-to-/owner-login')).toBeInTheDocument();
    expect(screen.getByTestId('link-to-/owner-register')).toBeInTheDocument();
  });

  it('renders the current year in the footer copyright', () => {
    render(React.createElement(PublicLandingTemplate));
    
    const currentYear = new Date().getFullYear().toString();
    const footerText = screen.getByText(new RegExp(`${currentYear} Costa Beach 3 HOA`));
    
    expect(footerText).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      React.createElement(
        PublicLandingTemplate,
        null,
        React.createElement('div', { 'data-testid': 'child-content' }, 'Child Content')
      )
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders all feature cards with icons', () => {
    render(React.createElement(PublicLandingTemplate));
    
    // Check if all feature sections are rendered with their descriptions
    expect(screen.getByText('Document Access')).toBeInTheDocument();
    expect(screen.getByText('Access all HOA documents, meeting minutes, and legal information in one secure location.')).toBeInTheDocument();
    
    expect(screen.getByText('Community Information')).toBeInTheDocument();
    expect(screen.getByText('Stay informed about community events, rules, and important announcements.')).toBeInTheDocument();
    
    expect(screen.getByText('Important Notifications')).toBeInTheDocument();
    expect(screen.getByText('Receive timely notifications about maintenance, meetings, and other important updates.')).toBeInTheDocument();
    
    expect(screen.getByText('Multilingual Support')).toBeInTheDocument();
    expect(screen.getByText('Access all information in your preferred language with our multilingual support.')).toBeInTheDocument();
  });

  // Test for responsive design would typically require more complex setup with jest-dom
  // This is a simplified version
  it('has responsive design classes', () => {
    render(React.createElement(PublicLandingTemplate));
    
    // Check for responsive grid classes
    const featuresGrid = screen.getByText('Portal Features').parentElement?.nextElementSibling;
    expect(featuresGrid).toHaveClass('grid');
    expect(featuresGrid).toHaveClass('grid-cols-1');
    expect(featuresGrid).toHaveClass('md:grid-cols-2');
    expect(featuresGrid).toHaveClass('lg:grid-cols-4');
    
    // Check for responsive footer
    const footer = screen.getByText('Quick Links').closest('div')?.parentElement;
    expect(footer).toHaveClass('grid');
    expect(footer).toHaveClass('grid-cols-1');
    expect(footer).toHaveClass('md:grid-cols-3');
  });
}); 