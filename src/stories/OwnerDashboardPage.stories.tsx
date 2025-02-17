"use client";

import { Meta, StoryObj } from "@storybook/react";
import OwnerDashboardPage from "@/app/owner-dashboard/page";

const meta: Meta<typeof OwnerDashboardPage> = {
  title: "Owner Portal/OwnerDashboardPage",
  component: OwnerDashboardPage,
};

export default meta;

type Story = StoryObj<typeof OwnerDashboardPage>;

export const Default: Story = {}; 