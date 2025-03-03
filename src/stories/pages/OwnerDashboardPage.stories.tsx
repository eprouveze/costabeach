"use client";

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import OwnerDashboardPage from '@/app/owner-dashboard/page';
import { createStoryDecorator } from '../utils/StoryProviders';

// Create a decorator with all the necessary providers
const withAllProviders = createStoryDecorator({
  withI18n: true,
  withTRPC: true,
  withSession: true,
  i18nMessages: {
    'owner.dashboard.title': 'Owner Dashboard',
    'owner.dashboard.properties': 'Your Properties',
    'owner.dashboard.documents': 'Documents',
    'owner.dashboard.bookings': 'Bookings',
    'owner.dashboard.statistics': 'Statistics',
    'owner.dashboard.welcome': 'Welcome back',
  }
});

const meta: Meta<typeof OwnerDashboardPage> = {
  title: 'Pages/OwnerDashboardPage',
  component: OwnerDashboardPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  // Use our combined provider decorator
  decorators: [withAllProviders],
};

export default meta;

type Story = StoryObj<typeof OwnerDashboardPage>;

export const Default: Story = {
  args: {},
}; 