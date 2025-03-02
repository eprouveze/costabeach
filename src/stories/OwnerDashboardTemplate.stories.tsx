import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import OwnerDashboardTemplate from "../components/OwnerDashboardTemplate";
import { I18nProvider } from "@/lib/i18n/client";

const meta: Meta<typeof OwnerDashboardTemplate> = {
  title: "Components/OwnerDashboardTemplate",
  component: OwnerDashboardTemplate,
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OwnerDashboardTemplate>;

export const Default: Story = {
  args: {
    children: <div className="p-4">Default content</div>,
  },
};

export const WithChildContent: Story = {
  args: {
    children: (
      <div className="p-4">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p>Additional details here.</p>
      </div>
    ),
  },
}; 