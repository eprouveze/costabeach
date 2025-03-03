import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  i18n: {
    // These are all the locales you want to support
    locales: ['fr', 'ar'],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: 'fr',
    // This is a list of locale domains and the default locale they
    // should handle (these are only required when setting up domain routing)
    // domains: [
    //   {
    //     domain: 'example.com',
    //     defaultLocale: 'fr',
    //   },
    //   {
    //     domain: 'example.ar',
    //     defaultLocale: 'ar',
    //   },
    // ],
  },
};

export default nextConfig;
