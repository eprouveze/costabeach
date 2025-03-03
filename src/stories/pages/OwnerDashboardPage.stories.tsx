"use client";

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import OwnerDashboardPage from '@/app/owner-dashboard/page';

const meta: Meta<typeof OwnerDashboardPage> = {
  title: 'Pages/OwnerDashboardPage',
  component: OwnerDashboardPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof OwnerDashboardPage>;

export const Default: Story = {
  args: {},
}; 