import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '../../components/organisms/Header';
import { NavItem } from '../../components/molecules/NavItem';
import { Home, FileText, Mail, User, Info } from 'lucide-react';
import { MockI18nProvider } from '../utils/MockI18nProvider';

// Mock translations for Storybook
const mockTranslations = {
  'navigation.home': 'Home',
  'navigation.about': 'About',
  'navigation.documents': 'Documents',
  'navigation.contact': 'Contact',
  'navigation.ownerPortal': 'Owner Portal',
  'navigation.toggleMenu': 'Toggle Menu',
  'common.language': 'Language',
};

// Create a wrapper component for documentation
const NavigationPatterns = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Navigation Patterns</h1>
      <p className="mb-6">
        This document outlines the navigation patterns used throughout the Costa Beach HOA Portal application.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Main Navigation</h2>
      <p className="mb-4">
        The main navigation is implemented through the <code>Header</code> component, which provides access to all primary sections of the application.
      </p>
      <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
        <Header />
      </div>

      <h3 className="text-xl font-bold mt-6 mb-3">Desktop Navigation</h3>
      <p className="mb-4">
        On desktop devices, the navigation is displayed as a horizontal menu with all items visible. The current page is highlighted with a different color and font weight.
      </p>

      <h3 className="text-xl font-bold mt-6 mb-3">Mobile Navigation</h3>
      <p className="mb-4">
        On mobile devices, the navigation is collapsed into a hamburger menu that can be toggled to show/hide the navigation items. The menu automatically closes when navigating to a new page.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Navigation Items</h2>
      <p className="mb-4">
        Navigation items are implemented using the <code>NavItem</code> component, which can be used in various contexts throughout the application.
      </p>
      <div className="flex flex-col space-y-2 mb-8 p-4 border border-gray-200 rounded-lg">
        <NavItem href="/" icon={Home} label="Home" />
        <NavItem href="/about" icon={Info} label="About" isActive={true} />
        <NavItem href="/documents" icon={FileText} label="Documents" />
        <NavItem href="/contact" icon={Mail} label="Contact" />
        <NavItem href="/owner-login" icon={User} label="Owner Portal" />
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Role-Based Navigation</h2>
      <p className="mb-4">
        The application implements role-based navigation, showing different navigation items based on the user's role:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2"><strong>Public users</strong>: See Home, About, Documents, Contact, and Owner Portal</li>
        <li className="mb-2"><strong>Authenticated owners</strong>: See Dashboard, Documents, Community, Settings, and Sign Out</li>
        <li className="mb-2"><strong>Administrators</strong>: See additional admin-specific navigation items</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Language-Aware Navigation</h2>
      <p className="mb-4">
        All navigation items are automatically translated based on the user's selected language. The application supports:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">French (default)</li>
        <li className="mb-2">Arabic (with RTL support)</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Navigation Structure</h2>
      <p className="mb-4">
        The application follows a hierarchical navigation structure:
      </p>
      <ol className="list-decimal pl-6 mb-6">
        <li className="mb-2"><strong>Primary Navigation</strong>: Main sections accessible from the header</li>
        <li className="mb-2"><strong>Secondary Navigation</strong>: Sub-sections within each primary section</li>
        <li className="mb-2"><strong>Contextual Navigation</strong>: Context-specific actions within a page</li>
      </ol>

      <h2 className="text-2xl font-bold mt-8 mb-4">Accessibility Considerations</h2>
      <p className="mb-4">
        The navigation components are built with accessibility in mind:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">All interactive elements are keyboard accessible</li>
        <li className="mb-2">ARIA attributes are used to indicate current state</li>
        <li className="mb-2">Mobile menu toggle includes proper ARIA expanded state</li>
        <li className="mb-2">Focus management is implemented for keyboard navigation</li>
      </ul>
    </div>
  );
};

// Create a decorator that wraps components with MockI18nProvider
const withI18nProvider = (Story: React.ComponentType) => (
  <MockI18nProvider 
    locale="en" 
    messages={mockTranslations}
  >
    <Story />
  </MockI18nProvider>
);

const meta: Meta<typeof NavigationPatterns> = {
  title: 'Documentation/Navigation Patterns',
  component: NavigationPatterns,
  decorators: [withI18nProvider],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Documentation for navigation patterns used throughout the Costa Beach HOA Portal application.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavigationPatterns>;

export const Default: Story = {
  args: {},
}; 