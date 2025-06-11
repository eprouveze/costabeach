import { addons } from '@storybook/preview-api';
import { EVENTS } from './constants';

// Mock MCP integration - In a real implementation, this would connect to your MCP tools
const mockMCP21stIntegration = {
  async searchComponents(query: string) {
    // This would normally call your MCP 21st magic component inspiration tool
    // For now, we'll return mock data to demonstrate the integration
    const mockResults = [
      {
        id: 'button-primary',
        name: 'Primary Button',
        description: 'A primary action button with modern styling',
        category: 'Buttons',
        code: `<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Primary Button
</button>`,
      },
      {
        id: 'form-input',
        name: 'Form Input',
        description: 'Styled form input with validation states',
        category: 'Forms',
        code: `<input 
  type="text" 
  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Enter text..."
/>`,
      },
      {
        id: 'modal-dialog',
        name: 'Modal Dialog',
        description: 'Accessible modal dialog with backdrop',
        category: 'Modals',
        code: `<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div className="bg-white rounded-lg p-6 w-96">
    <h2 className="text-xl font-bold mb-4">Modal Title</h2>
    <p className="mb-4">Modal content goes here...</p>
    <div className="flex justify-end space-x-2">
      <button className="px-4 py-2 text-gray-600 border rounded">Cancel</button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">Confirm</button>
    </div>
  </div>
</div>`,
      },
    ];

    // Filter results based on query
    return mockResults.filter(
      (component) =>
        component.name.toLowerCase().includes(query.toLowerCase()) ||
        component.category.toLowerCase().includes(query.toLowerCase()) ||
        component.description.toLowerCase().includes(query.toLowerCase())
    );
  },

  async getComponent(componentId: string) {
    // This would normally call your MCP 21st magic component builder tool
    const components = await this.searchComponents('');
    return components.find((c) => c.id === componentId);
  },
};

// Set up communication between the addon and preview
const channel = addons.getChannel();

channel.on(EVENTS.SEARCH_COMPONENTS, async ({ query }) => {
  try {
    const results = await mockMCP21stIntegration.searchComponents(query);
    channel.emit(EVENTS.SEARCH_RESULTS, results);
  } catch (error) {
    console.error('Error searching 21st.dev components:', error);
    channel.emit(EVENTS.SEARCH_RESULTS, []);
  }
});

channel.on(EVENTS.REQUEST_COMPONENT, async ({ componentId }) => {
  try {
    const component = await mockMCP21stIntegration.getComponent(componentId);
    if (component) {
      channel.emit(EVENTS.COMPONENT_RECEIVED, component);
    }
  } catch (error) {
    console.error('Error fetching 21st.dev component:', error);
  }
});

// Export for potential use in stories
export { mockMCP21stIntegration }; 