/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Disable Next.js i18n since we're handling it manually with middleware
  i18n: undefined,
  // Don't use the experimental i18n routes either
  experimental: {
    // Any experimental features can go here
  }
}

export default nextConfig; 