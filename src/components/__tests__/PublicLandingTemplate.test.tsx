/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PublicLandingTemplate from '@/components/templates/PublicLandingTemplate';
import { Locale } from '@/lib/i18n/config';

// Mock the useI18n hook
jest.mock('@/lib/i18n/client', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en' as Locale,
    dir: 'ltr',
  }),
}));

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ href, children, className, 'data-testid': dataTestId }: { href: string; children: React.ReactNode; className?: string; 'data-testid'?: string }) => {
    return (
      <a href={href} className={className} data-testid={dataTestId}>
        {children}
      </a>
    );
  };
});

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  FileText: () => <div data-testid="filetext-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  Info: () => <div data-testid="info-icon" />,
}));

// Mock the LanguageSwitcher component
jest.mock('@/components/LanguageSwitcher', () => {
  return function MockLanguageSwitcher({ variant }: { variant?: string }) {
    return <div data-testid="language-switcher">dropdown</div>;
  };
});

describe('PublicLandingTemplate', () => {
  it('renders the component correctly', () => {
    render(<PublicLandingTemplate />);
    
    // Get main sections
    const header = screen.getByRole('banner');
    const navigation = within(header).getByRole('navigation');
    const footer = screen.getByRole('contentinfo');
    
    // Check header logo
    expect(within(header).getByRole('link', { name: 'Costa Beach 3' })).toBeInTheDocument();
    
    // Check navigation links
    expect(within(navigation).getByText('common.contact')).toBeInTheDocument();
    expect(within(navigation).getByText('auth.signIn')).toBeInTheDocument();
    
    // Check hero section
    expect(screen.getByText('landing.heroTitle')).toBeInTheDocument();
    expect(screen.getByText('landing.heroSubtitle')).toBeInTheDocument();
    
    // Check features section
    expect(screen.getByText('landing.featuresTitle')).toBeInTheDocument();
    expect(screen.getAllByTestId(/.*-icon/)).toHaveLength(4);
    
    // Check footer
    expect(within(footer).getByText(/© 2025 Costa Beach 3 HOA./)).toBeInTheDocument();
  });

  it('renders the language switcher component', () => {
    render(<PublicLandingTemplate />);
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <PublicLandingTemplate>
        <div data-testid="child-component">Child content</div>
      </PublicLandingTemplate>
    );
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    // Update the component to add data-testid attributes to the links we want to test
    const { container } = render(<PublicLandingTemplate />);
    
    // Use getAllByText and check the first occurrence in the navigation
    const header = screen.getByRole('banner');
    const navigation = within(header).getByRole('navigation');
    
    // Get all links in the navigation
    const navLinks = within(navigation).getAllByRole('link');
    
    // Find the contact link (should be the first link with text 'common.contact')
    const contactLink = navLinks.find(link => link.textContent === 'common.contact');
    const signInLink = navLinks.find(link => link.textContent === 'auth.signIn');
    
    // Check that the links exist and have the correct href
    expect(contactLink).toBeDefined();
    expect(contactLink).toHaveAttribute('href', '/contact');
    
    expect(signInLink).toBeDefined();
    expect(signInLink).toHaveAttribute('href', '/owner-login');
    
    // Check CTA links in hero section
    const heroSection = screen.getByText('landing.heroTitle').closest('div')?.parentElement;
    expect(heroSection).not.toBeNull();
    
    if (heroSection) {
      const ctaLinks = within(heroSection).getAllByRole('link');
      expect(ctaLinks[0]).toHaveAttribute('href', '/owner-register');
      expect(ctaLinks[1]).toHaveAttribute('href', '/contact');
    }
  });

  it('renders the current year in the footer copyright', () => {
    render(<PublicLandingTemplate />);
    const currentYear = new Date().getFullYear().toString();
    const footer = screen.getByRole('contentinfo');
    const copyrightText = within(footer).getByText(new RegExp(`© ${currentYear} Costa Beach 3 HOA.`));
    expect(copyrightText).toBeInTheDocument();
  });

  it('renders all feature cards with icons', () => {
    render(<PublicLandingTemplate />);
    
    // Check all feature icons are rendered
    expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    
    // Check feature titles
    expect(screen.getByText('landing.features.documents.title')).toBeInTheDocument();
    expect(screen.getByText('landing.features.community.title')).toBeInTheDocument();
    expect(screen.getByText('landing.features.notifications.title')).toBeInTheDocument();
    expect(screen.getByText('landing.features.information.title')).toBeInTheDocument();
  });
}); 