import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PropertyDetailPage from '@/app/property-detail/page';
import { I18nProvider } from '@/lib/i18n/client';

const meta: Meta<typeof PropertyDetailPage> = {
  title: 'Pages/PropertyDetailPage',
  component: PropertyDetailPage,
  decorators: [
    (Story) => (
      <I18nProvider>
        <div className="p-4">
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Property detail page showing information about a property listing.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PropertyDetailPage>;

export default meta;

type Story = StoryObj<typeof PropertyDetailPage>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default view of the property detail page.',
      },
    },
  },
}; 