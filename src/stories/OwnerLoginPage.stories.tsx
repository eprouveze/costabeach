"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { SessionProvider } from "next-auth/react";
import OwnerLoginPage from "@/app/owner-login/page";

const meta = {
  title: "Owner Portal/OwnerLoginPage",
  component: OwnerLoginPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: 'The Owner Login page provides secure access to the owner portal using NextAuth authentication. It features a clean, modern design with a responsive layout.',
      },
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider>
        <Story />
      </SessionProvider>
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
        story: 'The default view of the login page showing the email-based authentication form with custom styling to match our brand.',
      },
    },
  },
}; 