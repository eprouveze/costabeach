import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from '../components/error/ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Utilities/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

const BuggyComponent = () => {
  throw new Error('Test error');
  return null;
};

const CustomFallback = () => (
  <div className="p-4 bg-yellow-100 rounded-lg">
    <h3 className="text-yellow-800">Custom Error View</h3>
    <p>This is a custom error fallback component.</p>
  </div>
);

export const Default: Story = {
  args: {
    children: <BuggyComponent />,
  },
};

export const WithCustomFallback: Story = {
  args: {
    children: <BuggyComponent />,
    fallback: <CustomFallback />,
  },
};

export const WithErrorHandler: Story = {
  args: {
    children: <BuggyComponent />,
    onError: (error, errorInfo) => {
      console.log('Caught an error:', error, errorInfo);
    },
  },
}; 