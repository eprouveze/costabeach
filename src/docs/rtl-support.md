# RTL Support Documentation

This document provides guidelines for implementing Right-to-Left (RTL) support in the Costa Beach 3 application.

## Overview

The application supports both Left-to-Right (LTR) languages like English and French, as well as Right-to-Left (RTL) languages like Arabic. To ensure a consistent user experience across all languages, we've implemented a comprehensive RTL support system.

## Key Components

### 1. DirectionProvider

The `DirectionProvider` component sets the HTML `dir` attribute based on the current locale. It should be used at the root of the application.

```tsx
import DirectionProvider from '@/components/DirectionProvider';

function App({ children }) {
  return (
    <DirectionProvider>
      {children}
    </DirectionProvider>
  );
}
```

### 2. RTL Utilities

The `src/lib/utils/rtl.ts` file contains utility functions for handling RTL-specific styling:

```tsx
import { getTextAlignClass, getFlexDirectionClass } from '@/lib/utils/rtl';

function MyComponent() {
  const { locale } = useI18n();
  const textAlignClass = getTextAlignClass(locale);
  
  return (
    <div className={textAlignClass}>
      {/* Content will be properly aligned based on locale */}
    </div>
  );
}
```

### 3. useRTL Hook

The `useRTL` hook provides a convenient way to access all RTL utilities:

```tsx
import { useRTL } from '@/lib/hooks/useRTL';

function MyComponent() {
  const rtl = useRTL();
  
  return (
    <div className={rtl.getContentClass()}>
      <div className={rtl.getFlexClass()}>
        {/* Content will have proper RTL styling */}
      </div>
    </div>
  );
}
```

### 4. RTLWrapper Component

The `RTLWrapper` component is a convenient wrapper that applies RTL utilities to its children:

```tsx
import RTLWrapper from '@/components/RTLWrapper';

function MyComponent() {
  return (
    <RTLWrapper 
      applyTextAlign={true}
      applyFlexDirection={true}
      applyTextDirection={true}
      applyListStyle={false}
    >
      {/* Content will have proper RTL styling */}
    </RTLWrapper>
  );
}
```

## Global CSS Rules

The application includes global CSS rules for RTL support in `src/styles/globals.css`. These rules handle common RTL styling needs:

- Text alignment
- List styling
- Flex direction
- Margins and padding
- Border positioning
- Form elements
- Table elements
- Grid layout
- Transforms
- Shadows
- Rounded corners
- Icons
- Input groups
- Dropdown menus
- Tooltips
- Modal dialogs
- Pagination
- Breadcrumbs
- Progress bars

## Best Practices

1. **Use the RTL utilities**: Always use the provided RTL utilities instead of hardcoding direction-specific styles.

2. **Text content**: Add the `rtl-text` class to paragraphs containing Arabic text to ensure proper punctuation placement.

3. **Lists**: Use the `getListStyleClass` utility for lists to ensure bullets appear on the correct side.

4. **Flex layouts**: Use the `getFlexDirectionClass` utility for flex containers to ensure proper ordering of elements.

5. **Icons**: Use the `getIconMarginClass` utility for icons to ensure proper spacing.

6. **Grid layouts**: Use the `getGridColumnClass` utility for grid layouts to ensure proper column positioning.

7. **Testing**: Always test your components in both LTR and RTL modes to ensure they display correctly.

## Common Issues and Solutions

### 1. Text Alignment

**Issue**: Text is not properly aligned in RTL mode.

**Solution**: Use the `getTextAlignClass` utility:

```tsx
<p className={getTextAlignClass(locale)}>Content</p>
```

### 2. List Bullets

**Issue**: List bullets appear on the wrong side in RTL mode.

**Solution**: Use the `getListStyleClass` utility:

```tsx
<ul className={`list-disc ${getListStyleClass(locale)} ${locale === 'ar' ? 'pr-5' : 'pl-5'}`}>
  <li>Item</li>
</ul>
```

### 3. Flex Direction

**Issue**: Elements in a flex container are ordered incorrectly in RTL mode.

**Solution**: Use the `getFlexDirectionClass` utility:

```tsx
<div className={`flex items-center ${getFlexDirectionClass(locale)}`}>
  <div>First</div>
  <div>Second</div>
</div>
```

### 4. Punctuation

**Issue**: Punctuation appears on the wrong side in RTL text.

**Solution**: Add the `rtl-text` class to paragraphs:

```tsx
<p className="rtl-text">Arabic text with punctuation.</p>
```

### 5. Icons

**Issue**: Icons are positioned incorrectly in RTL mode.

**Solution**: Use the `getIconMarginClass` utility:

```tsx
<div className="flex items-center">
  <Icon className={getIconMarginClass(locale)} />
  <span>Label</span>
</div>
```

## Testing RTL Support

To test RTL support:

1. Switch the language to Arabic using the language switcher.
2. Verify that text is right-aligned.
3. Verify that lists have bullets on the right side.
4. Verify that flex containers have elements ordered from right to left.
5. Verify that punctuation appears on the correct side of text.
6. Verify that icons are positioned correctly.
7. Verify that forms and input fields are properly aligned.

## Resources

- [MDN Web Docs: RTL](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
- [Tailwind CSS RTL](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) 