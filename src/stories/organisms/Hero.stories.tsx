import type { Meta, StoryObj } from '@storybook/react';
import Hero from '@/components/organisms/Hero';
import { I18nProvider } from '@/lib/i18n/client';

// Mock translations for Storybook
const mockTranslations = {
  'landing.heroTitle': 'Costa Beach 3 Homeowners Association Portal',
  'landing.heroSubtitle': 'Access important documents, community information, and association resources in one secure place.',
  'landing.registerCTA': 'Register as Owner',
  'landing.contactCTA': 'Contact Us',
};

const meta: Meta<typeof Hero> = {
  title: 'Organisms/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Hero>;

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

export const French: Story = {
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
};

export const Arabic: Story = {
  decorators: [
    (Story) => (
      <I18nProvider>
        <div dir="rtl">
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
}; 