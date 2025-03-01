import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ErrorBoundary } from '../components/error/ErrorBoundary';
import React, { useState } from 'react';

// Create a component that will throw an error when a button is clicked
const ErrorTrigger = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('Test error');
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">Error Trigger Component</h3>
      <p className="mb-4">Click the button below to trigger an error</p>
      <button 
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={() => setShouldThrow(true)}
      >
        Trigger Error
      </button>
    </div>
  );
};

// Create a custom fallback component for testing
const CustomFallback = () => (
  <div className="p-4 bg-yellow-100 rounded-lg">
    <h3 className="text-yellow-800">Custom Error View</h3>
    <p>This is a custom error fallback component.</p>
    <button 
      className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      onClick={() => window.location.reload()}
    >
      Reload Page
    </button>
  </div>
);

// Create a wrapper component that doesn't throw errors
const SafeWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border border-gray-200 rounded-lg">
    {children}
  </div>
);

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Utilities/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // Use a decorator to wrap all stories in a safe container
  decorators: [
    (Story) => (
      <SafeWrapper>
        <Story />
      </SafeWrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

// Define stories
export const Default: Story = {
  args: {
    children: <ErrorTrigger />,
  },
};

export const WithCustomFallback: Story = {
  args: {
    children: <ErrorTrigger />,
    fallback: <CustomFallback />,
  },
};

export const WithErrorHandler: Story = {
  args: {
    children: <ErrorTrigger />,
    onError: fn(),
  },
}; 