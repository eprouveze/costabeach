# RTL List Styling Guide

This document provides guidelines for implementing proper Right-to-Left (RTL) list styling in the Costa Beach 3 application.

## Overview

Lists in RTL languages like Arabic should have their bullets or numbers on the right side, not the left. This guide explains how to implement proper RTL list styling using our utility components and CSS rules.

## Components

### 1. RTLList Component

The `RTLList` component is a specialized component for RTL-aware lists. It handles proper RTL styling for lists including bullet positioning.

```tsx
import RTLList from '@/components/RTLList';

function MyComponent() {
  return (
    <RTLList type="ul" listStyleType="disc">
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </RTLList>
  );
}
```

#### Props

- `type`: The type of list (`"ul"` or `"ol"`). Default: `"ul"`.
- `listStyleType`: The style of list markers (`"disc"`, `"decimal"`, `"circle"`, `"square"`, or `"none"`). Default: `"disc"`.
- `className`: Additional CSS classes to apply.

### 2. RTLWrapper Component

The enhanced `RTLWrapper` component now supports list elements directly:

```tsx
import RTLWrapper from '@/components/RTLWrapper';

function MyComponent() {
  return (
    <RTLWrapper as="ul" applyListStyle={true}>
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </RTLWrapper>
  );
}
```

#### Props

- `as`: The HTML element to render (`"div"`, `"ul"`, `"ol"`, etc.). Default: `"div"`.
- `applyListStyle`: Whether to apply list styling. Default: `false`.
- `applyTextAlign`: Whether to apply text alignment. Default: `true`.
- `applyFlexDirection`: Whether to apply flex direction. Default: `false`.
- `applyTextDirection`: Whether to apply text direction. Default: `true`.
- `className`: Additional CSS classes to apply.

## CSS Rules

The application includes global CSS rules for RTL list styling in `src/styles/globals.css`:

```css
/* Enhanced RTL list styling */
[dir="rtl"] ul:not(.reset-rtl) {
  padding-right: 1.5rem;
  padding-left: 0;
  list-style-position: inside;
}

[dir="rtl"] ol:not(.reset-rtl) {
  padding-right: 1.5rem;
  padding-left: 0;
  list-style-position: inside;
}

/* Ensure list markers appear on the right side in RTL mode */
[dir="rtl"] ul:not(.reset-rtl) li::marker,
[dir="rtl"] ol:not(.reset-rtl) li::marker {
  margin-left: 0.5rem;
  margin-right: 0;
  unicode-bidi: isolate;
}

/* Custom RTL list style */
.rtl-list {
  list-style-position: inside;
}
```

## Best Practices

1. **Use the RTLList component**: For simple lists, use the `RTLList` component to ensure proper RTL styling.

2. **Use the RTLWrapper component**: For more complex content that includes lists, use the `RTLWrapper` component with the `as` prop set to `"ul"` or `"ol"`.

3. **Apply the rtl-list class**: If you need to style a list manually, apply the `rtl-list` class to ensure proper RTL styling.

4. **Test in Arabic**: Always test your lists in Arabic to ensure they display correctly.

## Common Issues and Solutions

### 1. List Bullets on Wrong Side

**Issue**: List bullets appear on the left side in RTL mode.

**Solution**: Use the `RTLList` component or apply the `rtl-list` class:

```tsx
<ul className="rtl-list">
  <li>Item</li>
</ul>
```

### 2. List Padding Issues

**Issue**: Lists have incorrect padding in RTL mode.

**Solution**: Use the `RTLList` component or apply the appropriate padding classes:

```tsx
<ul className={`rtl-list ${locale === 'ar' ? 'pr-5 pl-0' : 'pl-5 pr-0'}`}>
  <li>Item</li>
</ul>
```

### 3. Nested Lists

**Issue**: Nested lists have incorrect styling in RTL mode.

**Solution**: Apply the `rtl-list` class to all list levels:

```tsx
<ul className="rtl-list">
  <li>Item 1</li>
  <li>
    Item 2
    <ul className="rtl-list mt-2">
      <li>Nested Item 1</li>
      <li>Nested Item 2</li>
    </ul>
  </li>
</ul>
```

## Testing RTL List Styling

To test RTL list styling:

1. Switch the language to Arabic using the language switcher.
2. Verify that list bullets appear on the right side.
3. Verify that list items are properly indented from the right.
4. Verify that nested lists maintain proper RTL styling.
5. Verify that ordered lists (numbers) display correctly in RTL mode.

## Resources

- [MDN Web Docs: ::marker](https://developer.mozilla.org/en-US/docs/Web/CSS/::marker)
- [MDN Web Docs: list-style-position](https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-position)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) 