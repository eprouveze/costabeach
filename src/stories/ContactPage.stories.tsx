import type { Meta, StoryObj } from "@storybook/react";
import ContactPage from "../../app/contact/page";

const meta = {
  title: "Pages/ContactPage",
  component: ContactPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: 'Contact page with a form for users to send messages.',
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ContactPage>;

export default meta;

type Story = StoryObj<typeof ContactPage>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default view of the contact page with email and message form fields.',
      },
    },
  },
}; 