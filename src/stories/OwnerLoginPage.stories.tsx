"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { ClerkProvider } from "@clerk/nextjs";
import OwnerLoginPage from "@/app/owner-login/page";

const meta = {
  title: "Owner Portal/OwnerLoginPage",
  component: OwnerLoginPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: 'The Owner Login page provides secure access to the owner portal using Clerk authentication. It features a clean, modern design with a responsive layout.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ClerkProvider>
        <Story />
      </ClerkProvider>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof OwnerLoginPage>;

export default meta;

type Story = StoryObj<typeof OwnerLoginPage>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default view of the login page showing the Clerk authentication form with custom styling to match our brand.',
      },
    },
  },
}; 