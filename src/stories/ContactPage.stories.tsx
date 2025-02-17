import ContactPage from '@/app/contact/page';
import { Meta, Story } from '@storybook/react';

export default {
  title: 'Pages/ContactPage',
  component: ContactPage,
} as Meta;

const Template: Story = (args) => <ContactPage {...args} />;

export const Default = Template.bind({});
Default.args = {}; 