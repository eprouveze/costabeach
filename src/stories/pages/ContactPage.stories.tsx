import React from 'react';
import type { Meta, StoryObj } from "@storybook/react";
import ContactPage from "@/components/pages/ContactPage";
import { I18nProvider } from '@/lib/i18n/client';

const meta: Meta<typeof ContactPage> = {
  title: "Pages/ContactPage",
  component: ContactPage,
  decorators: [
    (Story) => (
      <I18nProvider>
        <div className="p-4">
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
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
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default view of the contact page with email and message form fields.',
      },
    },
  },
}; 