import type { Meta, StoryObj } from "@storybook/react";
import { OwnerPortalSidebar } from "@/components/organisms/OwnerPortalSidebar";
import { action } from '@storybook/addon-actions';

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

const handleNavigate = action('onNavigate');

export const Default: Story = {
  args: {
    currentPath: "/owner/dashboard",
    onNavigate: handleNavigate,
  },
};

export const OnDocumentsPage: Story = {
  args: {
    currentPath: "/owner/documents",
    onNavigate: handleNavigate,
  },
};

export const OnCommunityPage: Story = {
  args: {
    currentPath: "/owner/community",
    onNavigate: handleNavigate,
  },
};

export const OnSettingsPage: Story = {
  args: {
    currentPath: "/owner/settings",
    onNavigate: handleNavigate,
  },
}; 