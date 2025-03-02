const React = require('react');

const mockIcon = (name) => {
  const MockIcon = jest.fn(() => {
    return React.createElement('div', { 'data-testid': `${name.toLowerCase()}-icon` });
  });
  return MockIcon;
};

module.exports = {
  FileText: mockIcon('FileText'),
  Users: mockIcon('Users'),
  Bell: mockIcon('Bell'),
  Info: mockIcon('Info'),
  // Add any other icons used in your components
  ArrowRight: mockIcon('ArrowRight'),
  ChevronDown: mockIcon('ChevronDown'),
  ChevronUp: mockIcon('ChevronUp'),
  Menu: mockIcon('Menu'),
  X: mockIcon('X')
}; 