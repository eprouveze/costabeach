import { Meta, StoryObj } from '@storybook/react';
import { CATEGORY, SUBCATEGORY, createStoryTitle } from '../../../.storybook/storybook-organization';

// Import your component
// import YourComponent from '@/components/YourComponent';

// Define the component metadata
// Replace ATOMS with appropriate category and TEXT with appropriate subcategory
const meta: Meta = {
  title: createStoryTitle(CATEGORY.ATOMS, SUBCATEGORY.TEXT, 'YourComponent'),
  // component: YourComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description of your component and its usage.',
      },
    },
  },
  argTypes: {
    // Define your component's props and controls
    /*
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
      description: 'The variant of the component',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the component',
    },
    */
  },
  args: {
    // Default args for all stories
    /*
    variant: 'primary',
    size: 'md',
    */
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Define your stories
export const Default: Story = {
  args: {
    // Component-specific props for this story
  },
};

export const Variant: Story = {
  args: {
    // Variant-specific props
  },
};

// Add more variants as needed
/*
export const WithIcon: Story = {
  args: {
    // ...
  },
};

export const Disabled: Story = {
  args: {
    // ...
  },
};
*/

// Add a story with controls
export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground with all controls enabled.',
      },
    },
  },
}; 