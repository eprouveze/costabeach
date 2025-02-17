import type { Preview } from "@storybook/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

// Initialize MSW
initialize();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'responsive',
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'label',
            enabled: true,
          },
          {
            id: 'image-alt',
            enabled: true,
          },
          {
            id: 'button-name',
            enabled: true,
          },
          {
            id: 'heading-order',
            enabled: true,
          },
        ],
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/owner-login",
        query: {},
      },
    },
    themes: {
      default: "light",
      list: [
        { name: "light", class: "light", color: "#ffffff" },
        { name: "dark", class: "dark", color: "#0f172a" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen">
            <Story />
            <ToastContainer />
          </div>
        </ThemeProvider>
      </SessionProvider>
    ),
  ],
  loaders: [mswLoader],
};

export default preview; 