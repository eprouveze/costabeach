import type { Meta, StoryObj } from "@storybook/react";
import { OwnerPortalSidebar } from "@/components/organisms/OwnerPortalSidebar";

const meta: Meta<typeof OwnerPortalSidebar> = {
  title: "Organisms/OwnerPortalSidebar",
  component: OwnerPortalSidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof OwnerPortalSidebar>;

export const Default: Story = {
  args: {
    currentPath: "/owner/dashboard",
    onNavigate: (path) => console.log(`Navigating to: ${path}`),
  },
};

export const OnDocumentsPage: Story = {
  args: {
    currentPath: "/owner/documents",
    onNavigate: (path) => console.log(`Navigating to: ${path}`),
  },
};

export const OnCommunityPage: Story = {
  args: {
    currentPath: "/owner/community",
    onNavigate: (path) => console.log(`Navigating to: ${path}`),
  },
};

export const OnSettingsPage: Story = {
  args: {
    currentPath: "/owner/settings",
    onNavigate: (path) => console.log(`Navigating to: ${path}`),
  },
}; 