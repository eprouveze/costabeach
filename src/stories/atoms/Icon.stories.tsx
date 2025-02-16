import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "@/components/atoms/Icon";
import { Home, Mail, Settings, User, Bell } from "lucide-react";

const meta: Meta<typeof Icon> = {
  title: "Atoms/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    color: {
      control: "color",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    icon: Home,
  },
};

export const Small: Story = {
  args: {
    icon: Mail,
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    icon: Settings,
    size: "lg",
  },
};

export const Colored: Story = {
  args: {
    icon: Bell,
    color: "#3B82F6", // blue-500
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={User} size="xs" />
      <Icon icon={User} size="sm" />
      <Icon icon={User} size="md" />
      <Icon icon={User} size="lg" />
      <Icon icon={User} size="xl" />
    </div>
  ),
}; 