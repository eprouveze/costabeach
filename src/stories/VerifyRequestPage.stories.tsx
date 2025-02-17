import type { Meta, StoryObj } from "@storybook/react";
import VerifyRequestPage from "@/app/auth/verify/page";

const meta = {
  title: "Pages/Auth/Verify",
  component: VerifyRequestPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "The verification page shown after sending a magic link email, providing clear instructions and status.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof VerifyRequestPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "The default view of the verification page showing instructions to check email.",
      },
    },
  },
};

// You can add more stories here if you want to showcase different states or themes
export const DarkMode: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "The verification page in dark mode.",
      },
    },
    themes: {
      default: "dark",
    },
  },
}; 