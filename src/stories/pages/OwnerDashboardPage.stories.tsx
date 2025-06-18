"use client";

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DashboardContent } from '@/components/DashboardContent';
import OwnerDashboardTemplate from '@/components/templates/OwnerDashboardTemplate';

// Create a mock component that represents the owner dashboard page
const OwnerDashboardPageMock = () => (
  <OwnerDashboardTemplate>
    <DashboardContent />
  </OwnerDashboardTemplate>
);
import { I18nProvider } from '@/lib/i18n/client';
import { SessionProvider } from 'next-auth/react';
import MockTRPCProvider from '../../../.storybook/MockTRPCProvider';

// Create a decorator that wraps components with all necessary providers
const withProviders = (Story: React.ComponentType) => (
  <I18nProvider>
    <SessionProvider session={{ 
      user: { 
        id: "owner-user-id",
        email: "owner@example.com",
        name: "Owner User"
      }, 
      expires: "1" 
    }}>
      <MockTRPCProvider>
        <Story />
      </MockTRPCProvider>
    </SessionProvider>
  </I18nProvider>
);

const meta: Meta<typeof OwnerDashboardPageMock> = {
  title: 'Pages/OwnerDashboardPage',
  component: OwnerDashboardPageMock,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [withProviders],
};

export default meta;

type Story = StoryObj<typeof OwnerDashboardPageMock>;

export const Default: Story = {
  args: {},
}; 