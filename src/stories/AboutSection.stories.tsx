import type { Meta, StoryObj } from '@storybook/react';
import AboutSection from '@/components/AboutSection';
import React from 'react';
import { I18nProvider } from '../lib/i18n/client';

const meta: Meta<typeof AboutSection> = {
  title: 'Components/AboutSection',
  component: AboutSection,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <I18nProvider>
        <div className="bg-white">
          <Story />
        </div>
      </I18nProvider>
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