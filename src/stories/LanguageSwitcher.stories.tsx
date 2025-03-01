import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Locale, locales, localeNames } from "@/lib/i18n/config";
import { Globe } from "lucide-react";

// Create a mock LanguageSwitcher component specifically for Storybook
// This avoids the need for the I18nProvider context
const StorybookLanguageSwitcher = ({
  variant = "dropdown",
  className = "",
}) => {
  const [locale, setLocale] = useState<Locale>("fr" as Locale);
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if the current locale is RTL
  const isRTL = locale === 'ar';

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown
  const closeDropdown = () => setIsOpen(false);

  // Handle language change
  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    closeDropdown();
  };

  // Mock t function
  const t = (key: string) => key;

  // Render buttons variant
  if (variant === "buttons") {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              locale === loc
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            }`}
            aria-label={`Switch to ${localeNames[loc]}`}
          >
            {localeNames[loc]}
          </button>
        ))}
      </div>
    );
  }

  // Render dropdown variant (default)
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t("common.language")}
      >
        <Globe size={18} />
        <span className="ml-1">{localeNames[locale]}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={closeDropdown}
            aria-hidden="true"
          />

          {/* Dropdown menu */}
          <div
            className={`absolute z-20 mt-1 w-40 rounded-md bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
              isRTL ? "right-0" : "left-0"
            }`}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu-button"
          >
            <div className="py-1" role="none">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLanguageChange(loc)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    locale === loc
                      ? "bg-gray-100 dark:bg-gray-800 text-primary"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  role="menuitem"
                >
                  {localeNames[loc]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const meta = {
  title: "Components/LanguageSwitcher",
  component: StorybookLanguageSwitcher,
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
} satisfies Meta<typeof StorybookLanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary story - this will be used for the docs page
export const Docs: Story = {
  name: "Documentation",
  args: {
    variant: "dropdown",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The language switcher component allows users to change the application language between French and Arabic.",
      },
    },
  },
};

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