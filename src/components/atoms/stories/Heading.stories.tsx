import type { Meta, StoryObj } from "@storybook/react";
import Heading from "../Heading";

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

export const H1: Story = {
  args: {
    level: "h1",
    size: "2xl",
    children: "Main Heading (H1)",
  },
};

export const H2: Story = {
  args: {
    level: "h2",
    size: "xl",
    children: "Section Heading (H2)",
  },
};

export const H3: Story = {
  args: {
    level: "h3",
    size: "lg",
    children: "Subsection Heading (H3)",
  },
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