import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from '@/components/molecules/TextField';

const meta: Meta<typeof TextField> = {
  title: 'Molecules/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: 'Username',
    name: 'username',
    placeholder: 'Enter your username',
  },
};

export const Required: Story = {
  args: {
    label: 'Email',
    name: 'email',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    name: 'password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
    error: 'Password must be at least 8 characters long',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Full Name',
    name: 'fullName',
    placeholder: 'Enter your full name',
    value: 'John Doe',
  },
}; 