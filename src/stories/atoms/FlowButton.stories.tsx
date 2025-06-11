import type { Meta, StoryObj } from '@storybook/react';
import { FlowButton } from '@/components/atoms/FlowButton';

const meta = {
  title: 'Atoms/FlowButton',
  component: FlowButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A beautiful animated button component with flow-like visual effects. Features smooth hover animations, 
gradient backgrounds, floating particles, and multiple visual variants.

## Features
- **Smooth animations** with Framer Motion
- **Three variants**: default, gradient, and wave
- **Interactive hover effects** with ripples and particles
- **Accessibility focused** with proper ARIA attributes
- **Customizable** with className and all button props

## Variants
- **Default**: Clean design with blue-purple-pink gradient flow
- **Gradient**: Colorful gradient background with enhanced effects  
- **Wave**: Dynamic animated wave background with color transitions
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'Button text content',
    },
    variant: {
      control: 'select',
      options: ['default', 'gradient', 'wave'],
      description: 'Visual style variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
  },
} satisfies Meta<typeof FlowButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Get Started',
    variant: 'default',
  },
};

export const Gradient: Story = {
  args: {
    text: 'Explore More',
    variant: 'gradient',
  },
};

export const Wave: Story = {
  args: {
    text: 'Join Now',
    variant: 'wave',
  },
};

export const Disabled: Story = {
  args: {
    text: 'Disabled Button',
    variant: 'default',
    disabled: true,
  },
};

export const CustomText: Story = {
  args: {
    text: 'Custom Flow Button',
    variant: 'gradient',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 items-center">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">FlowButton Variants</h3>
        <p className="text-sm text-gray-600">Hover over each button to see the flow effects</p>
      </div>
      
      <div className="flex flex-col gap-4">
        <FlowButton text="Default Flow" variant="default" />
        <FlowButton text="Gradient Flow" variant="gradient" />
        <FlowButton text="Wave Flow" variant="wave" />
      </div>
      
      <div className="mt-6 text-center">
        <FlowButton text="Disabled State" variant="default" disabled />
      </div>
    </div>
  ),
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Showcase of all FlowButton variants with different visual effects and animations.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: () => (
    <div className="min-h-[400px] bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-8 rounded-lg">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Interactive FlowButton Demo</h3>
        <p className="text-gray-600 dark:text-gray-300">Experience the smooth animations and effects</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 items-center justify-items-center">
        <div className="text-center space-y-4">
          <h4 className="font-semibold">Default</h4>
          <FlowButton 
            text="Start Journey" 
            variant="default"
            onClick={() => alert('Default flow clicked!')}
          />
          <p className="text-xs text-gray-500">Blue-purple-pink gradient</p>
        </div>
        
        <div className="text-center space-y-4">
          <h4 className="font-semibold">Gradient</h4>
          <FlowButton 
            text="Discover" 
            variant="gradient"
            onClick={() => alert('Gradient flow clicked!')}
          />
          <p className="text-xs text-gray-500">Purple-blue-cyan gradient</p>
        </div>
        
        <div className="text-center space-y-4">
          <h4 className="font-semibold">Wave</h4>
          <FlowButton 
            text="Dive Deep" 
            variant="wave"
            onClick={() => alert('Wave flow clicked!')}
          />
          <p className="text-xs text-gray-500">Animated wave colors</p>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <FlowButton 
          text="Try All Effects" 
          variant="gradient"
          className="text-lg px-12 py-4"
          onClick={() => alert('All effects experienced!')}
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive demo showcasing the FlowButton in a real-world context with click handlers.',
      },
    },
  },
}; 