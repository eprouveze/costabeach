import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import OwnerDashboardTemplate from "../components/OwnerDashboardTemplate";

const meta: Meta<typeof OwnerDashboardTemplate> = {
  title: "Components/OwnerDashboardTemplate",
  component: OwnerDashboardTemplate,
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