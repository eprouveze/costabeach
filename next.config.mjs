/** @type {import('next').NextConfig} */
import webpack from 'webpack';
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
  reactStrictMode: true,
  // Disable Next.js i18n since we're handling it manually with middleware
  i18n: undefined,
  // Don't use the experimental i18n routes either
  experimental: {
    // Any experimental features can go here
  },
  webpack(config, { isServer }) {
    if (isServer) {
      // Ignore the pdf-parse test fixture that is referenced during SSR bundling
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /test\/data\/05-versions-space\.pdf$/,
        }),
      );

      // Ensure pdf-parse is required at runtime only (Node), not bundled. This
      // prevents the build process from executing its fixture-dependent code.
      if (!config.externals) config.externals = [];
      config.externals.push('pdf-parse');
    }
    return config;
  }
}

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(nextConfig); 