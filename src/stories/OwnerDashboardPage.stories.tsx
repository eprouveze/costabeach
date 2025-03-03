"use client";

import type { Meta, StoryObj } from '@storybook/react';
import OwnerDashboardPage from '@/app/owner-dashboard/page';
import { CATEGORY } from '../../.storybook/storybook-organization';

const meta: Meta<typeof OwnerDashboardPage> = {
  title: 'Pages/OwnerDashboard',
  component: OwnerDashboardPage,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof OwnerDashboardPage>;

export const Default: Story = {
  args: {},
}; 