import type { Meta, StoryObj } from '@storybook/react';
import { AuthWrapper } from '../components/auth/AuthWrapper';

const meta: Meta<typeof AuthWrapper> = {
  title: 'Utilities/AuthWrapper',
  component: AuthWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AuthWrapper>;

const ProtectedContent = () => (
  <div className="p-4 bg-green-100 rounded-lg">
    <h3 className="text-green-800">Protected Content</h3>
    <p>This content is protected by authentication.</p>
  </div>
);

export const Default: Story = {
  args: {
    children: <ProtectedContent />,
    requireAuth: true,
  },
};

export const PublicAccess: Story = {
  args: {
    children: <ProtectedContent />,
    requireAuth: false,
  },
};

export const WithRoleRestriction: Story = {
  args: {
    children: <ProtectedContent />,
    requireAuth: true,
    allowedRoles: ['admin'],
  },
}; 