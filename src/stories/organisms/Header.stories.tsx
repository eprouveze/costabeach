import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '../../components/organisms/Header';

const meta: Meta<typeof Header> = {
  title: 'Organisms/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
          The Header component is the main navigation element of the Costa Beach HOA Portal.
          It provides access to all main sections of the application and includes language switching functionality.
          
          ## Features
          - Responsive design with mobile menu
          - Active state highlighting for current page
          - Language switcher integration
          - Role-based navigation items
          - Accessibility support
          
          ## Usage Guidelines
          - The Header should be included in all page layouts
          - Navigation items are automatically translated based on the current language
          - Mobile menu automatically closes when navigating to a new page
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {},
  parameters: {
    viewport: { defaultViewport: 'desktop' },
    docs: {
      description: {
        story: 'The default desktop view of the header with all navigation items visible.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story: 'The mobile view of the header with collapsed menu. Click the menu icon to expand the navigation.',
      },
    },
  },
};

export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    docs: {
      description: {
        story: 'The tablet view of the header, which uses the desktop layout but with adjusted spacing.',
      },
    },
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'bg-gray-100',
  },
  parameters: {
    docs: {
      description: {
        story: 'The header with a custom background color applied through className prop.',
      },
    },
  },
};

export const DarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'The header in dark mode, showing how it adapts to dark color schemes.',
      },
    },
  },
}; 