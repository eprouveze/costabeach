import React from 'react';
import type { Preview } from "@storybook/react";
import "../src/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { StoryProviders } from '../src/stories/utils/StoryProviders';

// Order based on Atomic Design principles
const atomicDesignOrder = [
  'Documentation', // Documentation first
  'Design System', // Design System guidelines
  'Atoms',         // Smallest components
  'Molecules',     // Component compositions
  'Organisms',     // Complex components
  'Templates',     // Page templates
  'Pages',         // Full pages
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      // Sort stories based on Atomic Design
      storySort: {
        order: atomicDesignOrder,
        locales: 'en-US',
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#1a202c",
        },
      ],
    },
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      viewports: INITIAL_VIEWPORTS,
    },
  },
  decorators: [
    (Story) => (
      <StoryProviders>
        <div className="p-4">
          <Story />
        </div>
      </StoryProviders>
    ),
  ],
};

export default preview; 