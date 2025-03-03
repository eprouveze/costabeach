/* New File */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PublicLandingTemplate from '@/components/templates/PublicLandingTemplate';
import { I18nProvider } from '@/lib/i18n/client';

const meta: Meta<typeof PublicLandingTemplate> = {
  title: 'Templates/PublicLandingTemplate',
  component: PublicLandingTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <I18nProvider>
        <Story />
      </I18nProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PublicLandingTemplate>;

export const Default: Story = {
  args: {},
};

export const WithChildren: Story = {
  args: {
    children: (
      <div className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Additional Content</h2>
          <p className="text-center max-w-2xl mx-auto">
            This story demonstrates how additional content can be passed as children to the PublicLandingTemplate component.
          </p>
        </div>
      </div>
    ),
  },
};

// Responsive variants to demonstrate the component at different viewport sizes
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'This shows how the landing page appears on mobile devices (375px width).',
      },
    },
  },
  args: {},
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'This shows how the landing page appears on tablet devices (768px width).',
      },
    },
  },
  args: {},
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: 'This shows how the landing page appears on desktop screens (1440px width).',
      },
    },
  },
  args: {},
};

export const LargeDesktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
      defaultOrientation: 'landscape',
    },
    docs: {
      description: {
        story: 'This shows how the landing page appears on large desktop screens (1440px width).',
      },
    },
  },
  args: {},
};

export const ResponsiveGuide: Story = {
  parameters: {
    docs: {
      description: {
        story: `
## Responsive Design Implementation

The PublicLandingTemplate implements responsive design with the following breakpoints:

- **Mobile (< 768px)**: 
  - Single column layout
  - Stacked navigation items
  - Reduced font sizes
  - Full-width feature cards

- **Tablet (768px - 1023px)**:
  - Two-column layout for feature cards
  - Improved spacing
  - Horizontal navigation

- **Desktop (1024px+)**:
  - Four-column layout for feature cards
  - Three-column footer
  - Optimized spacing and typography

### Key Responsive Elements

1. **Navigation Header**:
   - On mobile, the navigation items stack or collapse into a hamburger menu
   - On larger screens, navigation displays horizontally

2. **Hero Section**:
   - Text size and spacing adjusts based on viewport
   - CTA buttons stack on mobile, display inline on larger screens

3. **Features Grid**:
   - Changes from 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)

4. **Footer**:
   - Single column on mobile
   - Three columns on larger screens

### Testing Responsive Behavior

Use the viewport controls in Storybook to test how the component responds to different screen sizes. The following viewports are available:

- **Mobile**: 375px × 667px
- **Tablet**: 768px × 1024px
- **Desktop**: 1440px × 900px
        `,
      },
    },
  },
  args: {},
}; 