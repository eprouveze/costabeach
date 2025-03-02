import type { Meta, StoryObj } from '@storybook/react';
import AboutSection from '@/components/AboutSection';
import React from 'react';

const meta: Meta<typeof AboutSection> = {
  title: 'Components/AboutSection',
  component: AboutSection,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="bg-white">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AboutSection>;

// Mock translations for the component
const mockTranslations: Record<string, string> = {
  'landing.aboutTitle': 'About Costa Beach 3',
  'landing.aboutSubtitle': 'A premier beachfront community in Casablanca, Morocco',
  'landing.aboutHistory.title': 'Our Community History',
  'landing.aboutHistory.paragraph1': 'Established in 2005, Costa Beach 3 was designed to be the premier residential community on Casablanca\'s coastline.',
  'landing.aboutHistory.paragraph2': 'Over the years, we\'ve grown into a thriving community of over 200 families who enjoy luxury beachfront living with world-class amenities.',
  'landing.aboutFeatures.title': 'What Makes Us Special',
  'landing.aboutFeatures.architecture': 'Modern Architecture',
  'landing.aboutFeatures.beachfront': 'Direct Beach Access',
  'landing.aboutFeatures.amenities': 'Premium Amenities',
  'landing.aboutFeatures.location': 'Prime Location',
  'landing.aboutCommunity.title': 'Community Highlights',
  'landing.aboutCommunity.services.title': 'Services',
  'landing.aboutCommunity.services.item1': '24/7 Security',
  'landing.aboutCommunity.services.item2': 'Maintenance & Landscaping',
  'landing.aboutCommunity.services.item3': 'Concierge Services',
  'landing.aboutCommunity.services.item4': 'Property Management',
  'landing.aboutCommunity.lifestyle.title': 'Lifestyle',
  'landing.aboutCommunity.lifestyle.item1': 'Swimming Pools',
  'landing.aboutCommunity.lifestyle.item2': 'Tennis Courts',
  'landing.aboutCommunity.lifestyle.item3': 'Community Events',
  'landing.aboutCommunity.lifestyle.item4': 'Beach Activities',
  'landing.learnMoreCTA': 'Learn More',
};

// Mock the useI18n hook
jest.mock('@/lib/i18n/client', () => ({
  useI18n: () => ({
    t: (key: string) => mockTranslations[key] || key,
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

export const Default: Story = {
  args: {},
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
}; 