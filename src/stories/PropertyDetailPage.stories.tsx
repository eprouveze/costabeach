import PropertyDetailPage from '@/app/property-detail/page';
import { Meta, Story } from '@storybook/react';

export default {
  title: 'Pages/PropertyDetailPage',
  component: PropertyDetailPage,
} as Meta;

const Template: Story = (args) => <PropertyDetailPage {...args} />;

export const Default = Template.bind({});
Default.args = {}; 