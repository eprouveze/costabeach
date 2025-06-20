import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
    "@storybook/addon-a11y",
    "@storybook/addon-viewport",
    {
      name: "@storybook/addon-styling-webpack",
      options: {},
    },

  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve(__dirname, "../src"),
        "@/lib/i18n/client": path.resolve(__dirname, "./mockI18n.tsx"),
        // Mock next-auth/react with our implementation
        "next-auth/react": path.resolve(__dirname, "./mockNextAuth"),
        "next/navigation": path.resolve(__dirname, "./mockNextNavigation"),
        // Mock react-toastify
        "react-toastify": path.resolve(__dirname, "./mockToastify"),
        // Mock trpc client
        "@/lib/trpc/react": path.resolve(__dirname, "./mockTrpc"),
        // Also mock the client import used by components
        "@/lib/trpc/client": path.resolve(__dirname, "./mockTrpc"),
      };
    }
    return config;
  },
};

export default config;
