import type { Preview } from "@storybook/react";
import { ClerkProvider } from "@clerk/nextjs";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <ClerkProvider>
        <Story />
      </ClerkProvider>
    ),
  ],
};

export default preview; 