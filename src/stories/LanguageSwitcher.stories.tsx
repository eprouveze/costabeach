import type { Meta, StoryObj } from "@storybook/react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const meta = {
  title: "Components/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A language switcher component that allows users to change the application language between French and Arabic.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "radio",
      options: ["dropdown", "buttons"],
      description: "The visual style of the language switcher",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the component",
    },
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dropdown: Story = {
  args: {
    variant: "dropdown",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The default dropdown variant of the language switcher. It displays the current language and shows a dropdown menu when clicked.",
      },
    },
  },
};

export const Buttons: Story = {
  args: {
    variant: "buttons",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The buttons variant of the language switcher. It displays all available languages as buttons, with the current language highlighted.",
      },
    },
  },
};

export const WithCustomClass: Story = {
  args: {
    variant: "dropdown",
    className: "border border-gray-300 rounded-lg",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The language switcher with custom CSS classes applied for styling.",
      },
    },
  },
}; 