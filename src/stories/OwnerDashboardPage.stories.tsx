"use client";

import { Meta, StoryObj } from "@storybook/react";
import OwnerDashboardPage from "@/app/owner-dashboard/page";
import { I18nProvider } from "@/lib/i18n/client";
import { MockTRPCProvider } from "@/lib/mocks/mockTrpc";

const meta: Meta<typeof OwnerDashboardPage> = {
  title: "Owner Portal/OwnerDashboardPage",
  component: OwnerDashboardPage,
  decorators: [
    (Story) => (
      <I18nProvider>
        <MockTRPCProvider>
          <Story />
        </MockTRPCProvider>
      </I18nProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof OwnerDashboardPage>;

export const Default: Story = {}; 