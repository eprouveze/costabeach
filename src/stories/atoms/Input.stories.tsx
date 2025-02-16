import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/atoms/Input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number"],
    },
    error: {
      control: "text",
    },
    label: {
      control: "text",
    },
    helperText: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Username",
    placeholder: "Enter username",
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    type: "password",
    error: "Password must be at least 8 characters",
    placeholder: "Enter password",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Email",
    type: "email",
    helperText: "We'll never share your email",
    placeholder: "Enter email",
  },
}; 