"use client";

import type { Meta, StoryObj } from "@storybook/react";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import OwnerLoginPage from "@/app/owner-login/page";

const meta = {
  title: "Pages/OwnerLoginPage",
  component: OwnerLoginPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "The login page for property owners, featuring email-based authentication with magic links.",
      },
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider>
        <Story />
        <ToastContainer />
      </SessionProvider>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof OwnerLoginPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "The default view of the login page showing the email input form.",
      },
    },
  },
};

export const WithError: Story = {
  args: {},
  parameters: {
    nextjs: {
      navigation: {
        query: {
          error: "AccessDenied",
        },
      },
    },
    docs: {
      description: {
        story: "Login page showing an error state when access is denied.",
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Login page in a loading state while processing the login request.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector("form");
    const input = canvasElement.querySelector('input[type="email"]') as HTMLInputElement;
    if (form && input) {
      input.value = "test@example.com";
      form.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  },
}; 