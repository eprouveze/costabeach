import type { Meta, StoryObj } from '@storybook/react';
import { NavItem } from '@/components/molecules/NavItem';
import { Home, Building2, Settings } from 'lucide-react';

const meta: Meta<typeof NavItem> = {
  title: 'Molecules/NavItem',
  component: NavItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: {
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
  },
};

export const Active: Story = {
  args: {
    href: '/properties',
    icon: Building2,
    label: 'Properties',
    isActive: true,
  },
};

export const WithLongLabel: Story = {
  args: {
    href: '/management',
    icon: Settings,
    label: 'Property Management & Settings',
  },
}; 