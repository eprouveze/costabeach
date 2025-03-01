import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";

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
        "@/lib/i18n/client": path.resolve(__dirname, "./mockI18n"),
        // We don't need to mock next-auth/react completely since we're using the real SessionProvider
        // with a mock session in our decorator
        "next/navigation": path.resolve(__dirname, "./mockNextNavigation"),
      };
    }
    return config;
  },
};

export default config;
