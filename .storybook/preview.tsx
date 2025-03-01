import type { Preview } from "@storybook/react";
import "../src/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import { withI18nProvider } from "./mockI18n";

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
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
};

export default preview; 