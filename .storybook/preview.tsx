import React from 'react';
import type { Preview } from "@storybook/react";
import "../src/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { I18nProvider } from '../src/lib/i18n/client';
import { TRPCProvider } from './mockTrpc';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
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
          value: "#1a1a1a",
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
      <I18nProvider>
        <TRPCProvider>
          <Story />
        </TRPCProvider>
      </I18nProvider>
    ),
  ],
};

export default preview; 