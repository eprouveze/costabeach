/* New File */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PublicLandingTemplate from '../components/templates/PublicLandingTemplate';

const meta = {
  title: 'Components/PublicLandingTemplate',
  component: PublicLandingTemplate,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PublicLandingTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithExtraContent: Story = {
  args: {
    children: (
      <div className="p-4">
        <h2 className="text-2xl font-bold">Welcome to Costabeach</h2>
        <p className="mt-2">Explore our property features and amenities.</p>
      </div>
    ),
  },
}; 