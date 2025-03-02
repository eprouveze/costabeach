const React = require('react');

const MockNextLink = jest.fn(({ href, children, className, ...props }) => {
  return React.createElement('a', { href, className, ...props }, children);
});

module.exports = MockNextLink; 