/* New File */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PublicLandingTemplate from '@/components/templates/PublicLandingTemplate';
import { I18nProvider } from '@/lib/i18n/client';

const meta: Meta<typeof PublicLandingTemplate> = {
  title: 'Templates/PublicLandingTemplate',
  component: PublicLandingTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PublicLandingTemplate>;

export const Default: Story = {
  args: {},
};

export const WithChildren: Story = {
  args: {
    children: (
      <div className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Additional Content</h2>
          <p className="text-center max-w-2xl mx-auto">
            This story demonstrates how additional content can be passed as children to the PublicLandingTemplate component.
          </p>
        </div>
      </div>
    ),
  },
}; 