import type { Meta, StoryObj } from "@storybook/react";
import Paragraph from "../Paragraph";

const meta: Meta<typeof Paragraph> = {
  title: "Atoms/Paragraph",
  component: Paragraph,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "base", "lg"],
    },
    variant: {
      control: "select",
      options: ["default", "muted", "info", "success", "warning", "error"],
    },
    weight: {
      control: "select",
      options: ["normal", "medium", "semibold"],
    },
    leading: {
      control: "select",
      options: ["none", "tight", "normal", "relaxed", "loose"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Paragraph>;

const sampleText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export const Default: Story = {
  args: {
    children: sampleText,
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: sampleText,
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: sampleText,
  },
};

export const Muted: Story = {
  args: {
    variant: "muted",
    children: sampleText,
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: sampleText,
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: sampleText,
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: sampleText,
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    children: sampleText,
  },
};

export const Semibold: Story = {
  args: {
    weight: "semibold",
    children: sampleText,
  },
};

export const RelaxedLeading: Story = {
  args: {
    leading: "relaxed",
    children: sampleText,
  },
}; 