import HomePage from '@/app/page';
import { Meta, StoryFn } from '@storybook/react';

export default {
  title: 'Pages/HomePage',
  component: HomePage,
} as Meta;

const Template: StoryFn = (args) => <HomePage {...args} />;

export const Default = Template.bind({});
Default.args = {}; 