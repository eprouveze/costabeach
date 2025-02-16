import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "@/components/atoms/Heading";

const meta: Meta<typeof Heading> = {
  title: "Atoms/Heading",
  component: Heading,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "2xl"],
    },
    weight: {
      control: "select",
      options: ["normal", "medium", "semibold", "bold"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    children: "Example Heading",
  },
};

export const H1: Story = {
  args: {
    level: "h1",
    size: "2xl",
    children: "H1 Heading",
  },
};

export const H2: Story = {
  args: {
    level: "h2",
    size: "xl",
    children: "H2 Heading",
  },
};

export const H3: Story = {
  args: {
    level: "h3",
    size: "lg",
    children: "H3 Heading",
  },
};

export const AllLevels: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading level="h1" size="2xl">H1 Heading</Heading>
      <Heading level="h2" size="xl">H2 Heading</Heading>
      <Heading level="h3" size="lg">H3 Heading</Heading>
      <Heading level="h4" size="md">H4 Heading</Heading>
      <Heading level="h5" size="sm">H5 Heading</Heading>
      <Heading level="h6" size="xs">H6 Heading</Heading>
    </div>
  ),
};

export const H4: Story = {
  args: {
    level: "h4",
    size: "md",
    children: "Paragraph Heading (H4)",
  },
};

export const CustomWeight: Story = {
  args: {
    level: "h2",
    size: "lg",
    weight: "bold",
    children: "Bold Heading",
  },
};

export const Small: Story = {
  args: {
    level: "h5",
    size: "xs",
    weight: "medium",
    children: "Small Heading",
  },
}; 