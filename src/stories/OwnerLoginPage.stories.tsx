"use client";

import { Meta, StoryObj } from "@storybook/react";
import OwnerLoginPage from "@/app/owner-login/page";

const meta: Meta<typeof OwnerLoginPage> = {
  title: "Owner Portal/OwnerLoginPage",
  component: OwnerLoginPage,
};

export default meta;

type Story = StoryObj<typeof OwnerLoginPage>;

export const Default: Story = {}; 