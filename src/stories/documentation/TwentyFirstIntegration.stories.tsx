import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

const meta = {
  title: 'Documentation/21st.dev Integration',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# 21st.dev Integration

This Storybook is set up to work seamlessly with 21st.dev components and design patterns.

## Integration Features

1. **MCP Tool Integration**: Use /ui and /21 commands in Cursor to generate components
2. **Component Exploration**: Browse and test 21st.dev inspired components
3. **Design System Alignment**: Compare your components with modern design patterns
4. **Code Generation**: Rapid prototyping with 21st.dev component patterns

## How to Use with Cursor

### MCP Commands
- \`/ui button\` - Generate a button component
- \`/21 form\` - Create form components using 21st.dev patterns
- \`/ui modal\` - Generate modal components

### Storybook Benefits
- **Live Preview**: See components in isolation
- **Props Testing**: Test different component states
- **Responsive Design**: Test across different viewports
- **Accessibility**: Built-in a11y testing

## Example Integration Workflow

1. Use Cursor MCP tools to generate a component
2. Create a story for the component
3. Test variations and states
4. Document usage patterns
5. Export for production use
        `,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TwentyFirstDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedComponent, setGeneratedComponent] = useState('');

  const demoSections = {
    overview: 'Overview',
    search: 'Component Search',
    generate: 'Code Generation',
    patterns: 'Design Patterns'
  };

  const sampleComponents = [
    {
      name: 'Modern Button',
      category: 'Atoms',
      description: 'Clean, accessible button with hover states',
      code: `<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Click me
</button>`
    },
    {
      name: 'Card Layout',
      category: 'Molecules',
      description: 'Flexible card component with shadow and padding',
      code: `<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here...</p>
</div>`
    },
    {
      name: 'Form Input',
      category: 'Atoms',
      description: 'Styled input with validation states',
      code: `<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    type="email"
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="Enter your email"
  />
</div>`
    }
  ];

  const filteredComponents = sampleComponents.filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeDemo) {
      case 'search':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Component Search</h3>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search components (e.g., button, card, form)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredComponents.map((component, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{component.name}</h4>
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">{component.category}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(component.code);
                        alert('Code copied to clipboard!');
                      }}
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{component.description}</p>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
                    <code>{component.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        );

      case 'generate':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Code Generation</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">🤖 MCP Integration</h4>
              <p className="text-blue-800 text-sm mb-3">
                Use these commands in Cursor to generate components automatically:
              </p>
              <div className="space-y-2 text-sm font-mono">
                <div className="bg-white p-2 rounded border">/ui button primary large</div>
                <div className="bg-white p-2 rounded border">/21 form contact</div>
                <div className="bg-white p-2 rounded border">/ui modal confirmation</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generate Component Code:
                </label>
                <select
                  onChange={(e) => {
                    const selected = sampleComponents.find(c => c.name === e.target.value);
                    setGeneratedComponent(selected ? selected.code : '');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a component to generate...</option>
                  {sampleComponents.map((component, index) => (
                    <option key={index} value={component.name}>{component.name}</option>
                  ))}
                </select>
              </div>

              {generatedComponent && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Generated Code:</h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedComponent);
                        alert('Code copied to clipboard!');
                      }}
                      className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                    <code>{generatedComponent}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      case 'patterns':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Design Patterns</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Atomic Design Structure</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span><strong>Atoms:</strong> Basic building blocks (buttons, inputs)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span><strong>Molecules:</strong> Simple combinations (search bars, cards)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span><strong>Organisms:</strong> Complex sections (headers, forms)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span><strong>Templates:</strong> Page layouts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span><strong>Pages:</strong> Specific instances</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">21st.dev Principles</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Accessibility-first design</li>
                  <li>• Mobile-responsive layouts</li>
                  <li>• Consistent spacing and typography</li>
                  <li>• Modern CSS techniques</li>
                  <li>• Performance optimization</li>
                  <li>• Component reusability</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium mb-4">Integration Workflow</h4>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                  <p className="font-medium">Design</p>
                  <p className="text-gray-600">Browse 21st.dev</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                  <p className="font-medium">Generate</p>
                  <p className="text-gray-600">Use MCP tools</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                  <p className="font-medium">Test</p>
                  <p className="text-gray-600">Create stories</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">4</div>
                  <p className="font-medium">Deploy</p>
                  <p className="text-gray-600">Use in production</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">21st.dev Integration Overview</h2>
              <p className="text-lg opacity-90">
                This Storybook is enhanced with 21st.dev integration for faster, better component development.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-semibold mb-2">Component Search</h3>
                <p className="text-gray-600 text-sm">
                  Find and explore components from the 21st.dev library with instant code access.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold mb-2">Rapid Generation</h3>
                <p className="text-gray-600 text-sm">
                  Use Cursor MCP tools to generate components with /ui and /21 commands.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold mb-2">Design Patterns</h3>
                <p className="text-gray-600 text-sm">
                  Follow modern design principles and atomic design methodology.
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">🚀 Quick Start</h3>
              <p className="text-yellow-700 text-sm">
                Navigate through the tabs above to explore different integration features. 
                Try the Component Search to see the integration in action!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
            {Object.entries(demoSections).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveDemo(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeDemo === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export const Overview: Story = {
  render: () => <TwentyFirstDemo />,
}; 