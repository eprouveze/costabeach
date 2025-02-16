import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '@/components/molecules/Card';

const meta: Meta<typeof Card> = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Ocean View Suite',
    description: 'Luxurious suite with breathtaking ocean views, modern amenities, and private balcony.',
  },
};

export const WithImage: Story = {
  args: {
    title: 'Beachfront Villa',
    description: 'Spectacular beachfront villa with direct access to pristine sandy beaches.',
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2',
  },
};

export const LongContent: Story = {
  args: {
    title: 'Penthouse Suite',
    description: 'Experience the ultimate in luxury living with our stunning penthouse suite. ' +
      'Featuring panoramic ocean views, premium furnishings, and exclusive access to VIP amenities. ' +
      'Perfect for those seeking an extraordinary coastal living experience.',
  },
}; 