import type { Meta } from "@storybook/react";

const meta = {
  title: "Introduction",
  parameters: {
    viewMode: "docs",
    previewTabs: {
      canvas: { hidden: true },
    },
    docs: {
      description: {
        component: `
# Costa Beach Design System

Welcome to the Costa Beach Owner Portal design system. This Storybook serves as both documentation and a development environment for our UI components.

## Component Categories

- **Pages**: Full page layouts and templates
  - Owner Login
  - Owner Registration
  - Admin Dashboard
  - Verification Pages

- **Features**:
  - Authentication with Magic Links
  - Owner Registration Management
  - Dark Mode Support
  - Responsive Design

## Tech Stack

- Next.js 14 with App Router
- Tailwind CSS for styling
- NextAuth.js for authentication
- Prisma for database management
- TypeScript for type safety

## Getting Started

1. Browse components in the sidebar
2. View documentation in the "Docs" tab
3. Interact with components in the "Canvas" tab
4. Test different states and variations using controls

## Best Practices

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Ensure dark mode compatibility
- Maintain accessibility standards
- Write comprehensive stories for all states
`,
      },
    },
  },
} satisfies Meta;

export default meta; 