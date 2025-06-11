"use client";

import type { Meta, StoryObj } from "@storybook/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ClientProvider from "@/components/ClientProvider";
import { FlowButton } from '@/components/atoms/FlowButton';
import { I18nProvider } from '@/lib/i18n/client';
import { SessionProvider } from 'next-auth/react';

// Create a decorator that wraps components with all necessary providers
const withProviders = (Story: React.ComponentType) => (
  <I18nProvider>
    <SessionProvider session={null}>
      <Story />
    </SessionProvider>
  </I18nProvider>
);

// Create a client-side version of HomePage for Storybook
function HomePage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <main className="flex-1 flex flex-col w-full mx-auto">
        <ClientProvider>
          <div className="flex-1 flex items-start justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
            <section className="max-w-7xl w-full space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <h1 className="text-4xl font-bold mt-10">
                  Welcome - Click the button below to get started
                </h1>
                <div className="w-full sm:w-auto flex justify-center">
                  <FlowButton
                    text="Get Started"
                    variant="gradient"
                    className="text-lg px-8 py-4 shadow-lg"
                    onClick={() => {
                      // In a real app, this would navigate to /auth/signin
                      alert('Navigation to /auth/signin would happen here');
                    }}
                  />
                </div>
              </div>
            </section>
          </div>
        </ClientProvider>
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} All Rights Reserved
          </span>
          <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
            <Link
              href="/privacy"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const meta = {
  title: "Pages/HomePage",
  component: HomePage,
  decorators: [withProviders],
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Default: Story = {};

export const EnhancedWithFlowButtons: Story = {
  render: () => (
    <div className="min-h-screen flex flex-col relative">
      <main className="flex-1 flex flex-col w-full mx-auto">
        <ClientProvider>
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
            <section className="max-w-4xl w-full space-y-12 text-center px-4">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Welcome to CostaBeach
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Experience the future of web development with our cutting-edge platform featuring beautiful animations and modern design.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                <FlowButton
                  text="Get Started"
                  variant="gradient"
                  className="text-lg px-10 py-4"
                  onClick={() => alert('Get Started clicked!')}
                />
                <FlowButton
                  text="Learn More"
                  variant="default"
                  className="text-lg px-10 py-4"
                  onClick={() => alert('Learn More clicked!')}
                />
                <FlowButton
                  text="Try Demo"
                  variant="wave"
                  className="text-lg px-10 py-4"
                  onClick={() => alert('Try Demo clicked!')}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-16">
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold">Fast Performance</h3>
                  <p className="text-gray-600 dark:text-gray-400">Lightning-fast loading times with optimized code</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold">Beautiful Design</h3>
                  <p className="text-gray-600 dark:text-gray-400">Stunning animations and modern UI components</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold">Responsive</h3>
                  <p className="text-gray-600 dark:text-gray-400">Perfect experience on all devices</p>
                </div>
              </div>
            </section>
          </div>
        </ClientProvider>
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} CostaBeach. All Rights Reserved
          </span>
          <div className="flex items-center gap-6">
            <FlowButton text="Contact Us" variant="default" className="text-sm px-4 py-2" />
          </div>
        </div>
      </footer>
    </div>
  ),
  decorators: [withProviders],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Enhanced homepage featuring FlowButton components with multiple variants, improved layout, and modern design elements.',
      },
    },
  },
}; 