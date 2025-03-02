const React = require('react');

const MockLanguageSwitcher = jest.fn(({ variant }) => {
  return React.createElement('div', { 'data-testid': 'language-switcher' }, variant);
});

module.exports = MockLanguageSwitcher; 