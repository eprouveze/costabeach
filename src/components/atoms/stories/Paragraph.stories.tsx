import type { Meta, StoryObj } from "@storybook/react";
import { Paragraph } from "../Paragraph";

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

export const Default: Story = {
  args: {
    children: "This is a default paragraph with base styling.",
  },
};

export const Muted: Story = {
  args: {
    variant: "muted",
    children: "This is a muted paragraph with reduced emphasis.",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: "This is an informational paragraph.",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "This is a success message paragraph.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "This is a warning message paragraph.",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    children: "This is an error message paragraph.",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Paragraph size="xs">Extra small paragraph text</Paragraph>
      <Paragraph size="sm">Small paragraph text</Paragraph>
      <Paragraph size="base">Base paragraph text</Paragraph>
      <Paragraph size="lg">Large paragraph text</Paragraph>
    </div>
  ),
};

export const AllWeights: Story = {
  render: () => (
    <div className="space-y-4">
      <Paragraph weight="normal">Normal weight text</Paragraph>
      <Paragraph weight="medium">Medium weight text</Paragraph>
      <Paragraph weight="semibold">Semibold weight text</Paragraph>
    </div>
  ),
};

export const AllLeadings: Story = {
  render: () => (
    <div className="space-y-8">
      <Paragraph leading="none">
        Leading none. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Vivamus sit amet dui scelerisque, tempus dui non, blandit nulla.
      </Paragraph>
      <Paragraph leading="tight">
        Leading tight. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Vivamus sit amet dui scelerisque, tempus dui non, blandit nulla.
      </Paragraph>
      <Paragraph leading="normal">
        Leading normal. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Vivamus sit amet dui scelerisque, tempus dui non, blandit nulla.
      </Paragraph>
      <Paragraph leading="relaxed">
        Leading relaxed. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Vivamus sit amet dui scelerisque, tempus dui non, blandit nulla.
      </Paragraph>
      <Paragraph leading="loose">
        Leading loose. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Vivamus sit amet dui scelerisque, tempus dui non, blandit nulla.
      </Paragraph>
    </div>
  ),
}; 