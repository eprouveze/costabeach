import type { Meta, StoryObj } from '@storybook/react';
import AboutSection from '@/components/AboutSection';
import React from 'react';

// Mock translations for the component
const mockTranslations: Record<string, string> = {
  'landing.aboutTitle': 'About Costa Beach 3',
  'landing.aboutSubtitle': 'A premier beachfront community in Casablanca, Morocco',
  'landing.aboutHistory.title': 'Our Community History',
  'landing.aboutHistory.paragraph1': 'Established in 2005, Costa Beach 3 was designed to be the premier residential community on Casablanca\'s coastline.',
  'landing.aboutHistory.paragraph2': 'Over the years, we\'ve grown into a thriving community of over 200 families who enjoy luxury beachfront living with world-class amenities.',
  'landing.aboutFeatures.title': 'What Makes Us Special',
  'landing.aboutFeatures.modern.title': 'Modern Architecture',
  'landing.aboutFeatures.modern.description': 'Contemporary design with spacious layouts and premium finishes throughout the property.',
  'landing.aboutFeatures.beach.title': 'Beachfront Access',
  'landing.aboutFeatures.beach.description': 'Direct access to a pristine private beach with stunning views of the Atlantic Ocean.',
  'landing.aboutFeatures.amenities.title': 'Premium Amenities',
  'landing.aboutFeatures.amenities.description': 'Swimming pools, fitness center, gardens, and recreational areas for all residents.',
  'landing.aboutFeatures.location.title': 'Prime Location',
  'landing.aboutFeatures.location.description': 'Conveniently located with easy access to shopping, dining, and entertainment options.',
  'landing.aboutCommunity.title': 'Community Highlights',
  'landing.aboutCommunity.services.title': 'Services & Management',
  'landing.aboutCommunity.services.item1': '24/7 security and concierge services',
  'landing.aboutCommunity.services.item2': 'Professional property management',
  'landing.aboutCommunity.services.item3': 'Regular maintenance of common areas',
  'landing.aboutCommunity.services.item4': 'Dedicated resident support team',
  'landing.aboutCommunity.lifestyle.title': 'Lifestyle & Activities',
  'landing.aboutCommunity.lifestyle.item1': 'Community events and gatherings',
  'landing.aboutCommunity.lifestyle.item2': 'Beachfront activities and water sports',
  'landing.aboutCommunity.lifestyle.item3': 'Fitness classes and wellness programs',
  'landing.aboutCommunity.lifestyle.item4': 'Family-friendly environment',
  'landing.learnMoreCTA': 'Learn More',
};

// Manual mock for useI18n
// This replaces the Jest mock with a manual implementation
import * as i18nClient from '@/lib/i18n/client';

// Save the original module
const originalModule = { ...i18nClient };

// Override the useI18n function for Storybook
(i18nClient as any).useI18n = () => ({
  t: (key: string) => mockTranslations[key] || key,
});

// Override the I18nProvider component for Storybook
(i18nClient as any).I18nProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

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