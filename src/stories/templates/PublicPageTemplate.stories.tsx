import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import PublicPageTemplate from "@/components/templates/PublicPageTemplate";
import { I18nProvider } from "@/lib/i18n/client";

const meta: Meta<typeof PublicPageTemplate> = {
  title: "Templates/PublicPageTemplate",
  component: PublicPageTemplate,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PublicPageTemplate>;

export const Default: Story = {
  args: {
    children: <div className="p-4">Default content</div>,
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Page Title</h1>
        <p className="text-gray-600 mb-4">
          This is an example of content that would be displayed within the PublicPageTemplate.
          This template provides the standard layout for public-facing pages including the header and footer.
        </p>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Information Section</h2>
          <p className="text-blue-600">
            Important information can be displayed in highlighted sections like this one.
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors">
          Call to Action
        </button>
      </div>
    ),
  },
};

// Responsive variants to demonstrate the component at different viewport sizes
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile",
    },
    docs: {
      description: {
        story: "How the public page template appears on mobile devices (375px width).",
      },
    },
  },
  args: {
    children: <div className="p-4 bg-white rounded-lg">Mobile content example</div>,
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: "How the public page template appears on tablet devices (768px width).",
      },
    },
  },
  args: {
    children: <div className="p-4 bg-white rounded-lg">Tablet content example</div>,
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        story: "How the public page template appears on desktop screens (1440px width).",
      },
    },
  },
  args: {
    children: <div className="p-4 bg-white rounded-lg">Desktop content example</div>,
  },
};

export const ResponsiveGuide: Story = {
  parameters: {
    docs: {
      description: {
        story: `
## Responsive Design Implementation

The PublicPageTemplate implements responsive design with the following features:

- **Container with max width**: Content is constrained within a max-width container for readability
- **Responsive padding**: Padding scales with screen size (px-4 default, larger on medium screens)
- **Flexible layout**: Uses flex-col to ensure footer stays at bottom regardless of content height
- **Centered content**: Uses mx-auto to center content horizontally

### Key Responsive Elements

1. **Header**:
   - Adapts to different screen sizes with appropriate navigation display
   - Mobile navigation on small screens, horizontal navigation on larger screens

2. **Main Content Area**:
   - Padding adjusts based on screen size
   - Content width is constrained for better readability on large screens
   - Flex-grow ensures content area expands to fill available space

3. **Footer**:
   - Stays at the bottom of the page regardless of content height
   - Responsive layout adapts to screen width

### Testing Responsive Behavior

Use the viewport controls in Storybook to test how the component responds to different screen sizes:

- **Mobile**: 375px × 667px
- **Tablet**: 768px × 1024px  
- **Desktop**: 1440px × 900px
        `,
      },
    },
  },
  args: {
    children: <div className="p-4 bg-white rounded-lg">Example content for responsive testing</div>,
  },
}; 