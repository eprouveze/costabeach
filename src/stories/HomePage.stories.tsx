import HomePage from '@/app/page';
import { Meta, Story } from '@storybook/react';

export default {
  title: 'Pages/HomePage',
  component: HomePage,
} as Meta;

const Template: Story = (args) => <HomePage {...args} />;

export const Default = Template.bind({});
Default.args = {}; 