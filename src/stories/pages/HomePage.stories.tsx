"use client";

import type { Meta, StoryObj } from "@storybook/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ClientProvider from "@/components/ClientProvider";
import { createStoryDecorator } from "../utils/StoryProviders";

// Create a decorator with all the necessary providers
const withProviders = createStoryDecorator({
  withI18n: true,
  withSession: true,
  withTRPC: false, // No tRPC needed for HomePage
});

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
                <Link
                  href="/auth/signin"
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg px-8 py-4 text-lg font-medium shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
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