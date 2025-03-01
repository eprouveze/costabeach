import type { Preview } from "@storybook/react";
import "../src/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { SessionProvider } from "next-auth/react";
import { withI18nProvider } from "./mockI18n";

// Initialize MSW
// This is needed for the auth provider
const mockSession = {
  data: {
    user: {
      name: "Test User",
      email: "test@example.com",
      image: "https://avatars.githubusercontent.com/u/1234567?v=4",
    },
    expires: "2021-10-10T00:00:00.000Z",
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
    withI18nProvider,
    (Story) => (
      <SessionProvider session={mockSession.data}>
        <div className="p-4">
          <Story />
        </div>
      </SessionProvider>
    ),
  ],
};

export default preview; 