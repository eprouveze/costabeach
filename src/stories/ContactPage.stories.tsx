import ContactPage from "../../app/contact/page";
import { Meta, StoryFn } from '@storybook/react';

export default {
  title: 'Pages/ContactPage',
  component: ContactPage,
} as Meta;

const Template: StoryFn = (args) => <ContactPage {...args} />;

export const Default = Template.bind({});
Default.args = {}; 