import type { Meta, StoryObj } from '@storybook/react';
import { Form } from '@/components/molecules/Form';
import { TextField } from '@/components/molecules/TextField';

const meta: Meta<typeof Form> = {
  title: 'Molecules/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  args: {
    buttonText: 'Submit',
    onSubmit: (data) => console.log('Form submitted:', data),
  },
  render: (args) => (
    <Form {...args}>
      <TextField
        label="Name"
        name="name"
        placeholder="Enter your name"
        required
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        required
      />
    </Form>
  ),
};

export const WithError: Story = {
  args: {
    buttonText: 'Submit',
    onSubmit: (data) => console.log('Form submitted:', data),
  },
  render: (args) => (
    <Form {...args}>
      <TextField
        label="Name"
        name="name"
        placeholder="Enter your name"
        required
        error="This field is required"
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        required
      />
    </Form>
  ),
}; 