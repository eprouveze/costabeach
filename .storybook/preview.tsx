import type { Preview } from "@storybook/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import { initialize } from "msw-storybook-addon";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../src/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

// Initialize MSW
initialize();

// Mock session data
const mockSession = {
  data: {
    user: {
      email: "test@example.com",
      name: "Test User",
      image: null,
      id: "test-user-id",
      role: "user",
      isAdmin: false,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  status: "authenticated",
};

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
    nextauth: {
      session: mockSession,
    },
    msw: {
      handlers: [],
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
  },
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession.data}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen">
            <Story />
            <ToastContainer />
          </div>
        </ThemeProvider>
      </SessionProvider>
    ),
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview; 