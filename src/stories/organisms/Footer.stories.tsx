import type { Meta, StoryObj } from '@storybook/react';
// import { Footer } from '@/components/organisms/Footer';

const meta: Meta<any> = {
  title: 'Organisms/Footer',
  // component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

export const Default: Story = {
  render: () => (
    <div className="bg-gray-100 p-4 text-center">
      Footer component to be implemented
    </div>
  ),
}; 