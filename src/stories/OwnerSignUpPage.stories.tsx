"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { SessionProvider } from "next-auth/react";
import OwnerSignUpPage from "../../app/owner-signup/page";

const meta = {
  title: "Owner Portal/OwnerSignUpPage",
  component: OwnerSignUpPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "The sign-up page for property owners, featuring email-based authentication.",
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
} satisfies Meta<typeof OwnerSignUpPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The default view of the sign-up page showing the email-based registration form with custom styling to match our brand.',
      },
    },
  },
}; 