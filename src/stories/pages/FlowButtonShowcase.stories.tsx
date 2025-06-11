"use client";

import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FlowButton } from '@/components/atoms/FlowButton';
import { SessionProvider } from "next-auth/react";

// Landing Page Component
const LandingPageWithFlow = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
    <section className="pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Beautiful Flows
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Experience the next generation of interactive buttons with smooth animations and stunning visual effects.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <FlowButton 
            text="Get Started" 
            variant="gradient" 
            className="text-lg px-8 py-4"
            onClick={() => alert('Get Started!')}
          />
          <FlowButton 
            text="Watch Demo" 
            variant="wave" 
            className="text-lg px-8 py-4"
            onClick={() => alert('Demo time!')}
          />
        </div>
      </div>
    </section>

    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose FlowButton?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-4">Smooth Animations</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Beautiful hover effects with floating particles and gradient flows</p>
            <FlowButton text="Try Animation" variant="default" className="px-6 py-2" />
          </div>
          <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-4">Multiple Variants</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Three distinct styles: default, gradient, and wave effects</p>
            <FlowButton text="Explore Variants" variant="gradient" className="px-6 py-2" />
          </div>
          <div className="text-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-4">Performance</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Optimized animations that don't compromise performance</p>
            <FlowButton text="Learn More" variant="wave" className="px-6 py-2" />
          </div>
        </div>
      </div>
    </section>
  </div>
);

const meta = {
  title: "Pages/FlowButtonShowcase", 
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Comprehensive showcase of FlowButton integration across different page types and contexts.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story: React.ComponentType) => (
      <SessionProvider>
        <Story />
      </SessionProvider>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const LandingPage: Story = {
  render: () => <LandingPageWithFlow />,
  parameters: {
    docs: {
      description: {
        story: 'Modern landing page showcasing FlowButton in hero section and feature cards with gradient backgrounds and call-to-action buttons.',
      },
    },
  },
}; 