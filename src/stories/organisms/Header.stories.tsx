import type { Meta, StoryObj } from '@storybook/react';
// import { Header } from '@/components/organisms/Header';

const meta: Meta<any> = {
  title: 'Organisms/Header',
  // component: Header,
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
      Header component to be implemented
    </div>
  ),
}; 