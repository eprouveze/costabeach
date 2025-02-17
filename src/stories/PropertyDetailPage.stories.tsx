import PropertyDetailPage from '@/app/property-detail/page';
import { Meta, StoryFn } from '@storybook/react';

export default {
  title: 'Pages/PropertyDetailPage',
  component: PropertyDetailPage,
} as Meta;

const Template: StoryFn = (args) => <PropertyDetailPage {...args} />;

export const Default = Template.bind({});
Default.args = {}; 