# RTL Development Plan for Costa Beach

## Current State Analysis

### What's Working
- Basic RTL support via the `dir` attribute on HTML elements
- DirectionProvider component that sets the `dir` attribute based on locale
- Global CSS rules for RTL text alignment and list styling
- Specialized components: RTLText, RTLList, and RTLWrapper
- Utility functions for RTL-specific Tailwind classes
- Component-level support for RTL layouts

### Challenges with Current Approach
- Manual process of adding RTL components to individual pages
- Inconsistent application across the site
- Maintenance overhead when new components are added
- Mixed approaches to handling RTL styles
- Potential for missed content that requires RTL styling

## Proposed Solution

### 1. Systematic RTL Architecture

#### HTML Document Level
- Maintain the current approach of setting `dir="rtl"` on the HTML element based on locale
- Ensure the DirectionProvider is properly integrated at the root layout

#### CSS Level
- Leverage Tailwind CSS's logical properties (v3.3+) 
- Use logical properties instead of directional ones:
  - Replace `mr/ml` with `me/ms` (margin-end/margin-start)
  - Replace `pr/pl` with `pe/ps` (padding-end/padding-start)
  - Replace `right/left` with `end/start`
  - Replace `text-right/text-left` with `text-end/text-start`

#### Component Level
- Create an RTL context provider that centralizes RTL detection logic
- Refactor existing RTL components to use this context
- Create a comprehensive suite of RTL-aware components

### 2. Migration Strategy

#### Phase 1: Foundation
- Add Tailwind CSS logical properties support
- Create RTL context provider
- Update global CSS rules for RTL support
- Update DirectionProvider to work with RTL context
- Document the new architecture

#### Phase 2: Component Refactoring
- Update existing RTL components to use the new architecture
- Create new RTL-aware components for common UI patterns
- Implement automated testing for RTL layouts

#### Phase 3: Application-wide Implementation
- Systematically update all pages to use the new RTL architecture
- Implement RTL support in all templates and layouts
- Create visual regression tests for RTL layouts

### 3. Technical Implementation

#### RTL Context Provider
```tsx
// src/lib/rtl/context.tsx
"use client";

import React, { createContext, useContext } from "react";
import { useI18n } from "@/lib/i18n/client";

interface RTLContextType {
  isRTL: boolean;
  direction: "rtl" | "ltr";
}

const RTLContext = createContext<RTLContextType>({
  isRTL: false,
  direction: "ltr",
});

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const isRTL = locale === 'ar';
  const direction = isRTL ? "rtl" : "ltr";
  
  return (
    <RTLContext.Provider value={{ isRTL, direction }}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL() {
  return useContext(RTLContext);
}
```

#### Tailwind Configuration for Logical Properties
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // Add any custom RTL configurations here
    },
  },
  plugins: [
    // Add the rtl plugin if needed
  ],
};
```

#### Automatic RTL Component Wrapper
```tsx
// src/lib/rtl/withRTL.tsx
"use client";

import React from "react";
import { useRTL } from "./context";

// Higher-order component for automatic RTL support
export function withRTL<P extends object>(
  Component: React.ComponentType<P>,
  options = { applyTextAlign: true, applyDirection: true }
): React.FC<P> {
  return function RTLComponent(props: P) {
    const { isRTL } = useRTL();
    
    // Apply RTL-specific classes or props
    const rtlProps = {
      ...props,
      className: `${props.className || ''} ${
        isRTL && options.applyTextAlign ? 'text-end' : ''
      } ${
        isRTL && options.applyDirection ? 'rtl-text' : ''
      }`.trim(),
    };
    
    return <Component {...rtlProps} />;
  };
}
```

## Best Practices

### Layouts
- Use Flexbox with `flex-direction` for horizontal layouts
- Use CSS Grid with logical properties for complex layouts
- Apply RTL transformations at the layout level, not individual components

### Text & Typography
- Use the RTLText component for paragraphs in mixed content
- Use CSS logical properties for text alignment

### Lists
- Use the RTLList component for all lists that need RTL support
- Apply list-style-position and proper padding

### Forms & Inputs
- Ensure input alignment respects RTL direction
- Place labels and error messages consistently

### Icons & Images
- Mirror directional icons in RTL mode
- Maintain cultural appropriateness in RTL contexts

### Navigation
- Ensure navigation flows from right to left in RTL mode
- Properly align dropdown menus and submenus

## Implementation Guidelines

### For Developers
1. For new components, use logical properties in Tailwind CSS
   - `ms-2` instead of `ml-2`
   - `pe-4` instead of `pr-4`
   - `text-start` instead of `text-left`

2. Use RTL-aware components:
   - `<RTLText>` for paragraphs
   - `<RTLList>` for lists
   - `<RTLWrapper>` for custom layouts

3. For complex layouts, use the RTL context:
   ```tsx
   const { isRTL } = useRTL();
   
   return (
     <div className={isRTL ? 'flex-row-reverse' : 'flex-row'}>
       {/* content */}
     </div>
   );
   ```

4. Apply RTL-specific styles using the `dir` attribute:
   ```css
   [dir="rtl"] .my-component {
     /* RTL-specific styles */
   }
   ```

### Testing Checklist
- Visual checking in both RTL and LTR modes
- Verify text alignment and line breaking
- Check navigation flow and user interaction
- Verify list bullet positioning
- Test form input alignment and behavior
- Check dropdown and overlay positioning

## Timeline and Priorities

### Immediate Actions
- Implement RTL context provider
- Update tailwind configuration for logical properties
- Document RTL best practices

### Short-term Goals (1-2 weeks)
- Refactor existing RTL components to use the new architecture
- Create automated tests for RTL layouts
- Update templates and layouts with RTL support

### Mid-term Goals (2-4 weeks)
- Systematically update all pages to use the new RTL architecture
- Implement visual regression tests for RTL layouts
- Train developers on RTL best practices

### Long-term Vision
- Complete RTL support across all application features
- Establish RTL checking as part of CI/CD pipelines
- Regular audits of RTL support quality

## Resources and References
- [MDN Web Docs: CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [RTL Styling Best Practices](https://rtlstyling.com/posts/rtl-styling)
- [Tailwind CSS RTL support](https://tailwindcss.com/docs/hover-focus-and-other-states#rtl-support)
- [Material Design for RTL](https://material.io/design/usability/bidirectionality.html) 