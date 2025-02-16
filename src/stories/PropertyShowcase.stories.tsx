import type { Meta, StoryObj } from "@storybook/react";
import { PropertyShowcase } from "../components/organisms/PropertyShowcase";

const meta = {
  title: "Organisms/PropertyShowcase",
  component: PropertyShowcase,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PropertyShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: "bg-white",
  },
}; 