"use client";

import { Meta, StoryObj } from "@storybook/react";
import OwnerDashboardPage from "@/app/owner-dashboard/page";
import { I18nProvider } from "@/lib/i18n/client";

const meta: Meta<typeof OwnerDashboardPage> = {
  title: "Owner Portal/OwnerDashboardPage",
  component: OwnerDashboardPage,
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OwnerDashboardPage>;

export const Default: Story = {}; 