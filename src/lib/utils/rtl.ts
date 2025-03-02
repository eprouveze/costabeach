/**
 * RTL (Right-to-Left) utilities for proper Arabic language support
 */

/**
 * Returns the appropriate text alignment class based on the current locale
 * @param locale The current locale
 * @returns Tailwind text alignment class
 */
export const getTextAlignClass = (locale: string): string => {
  return locale === 'ar' ? 'text-right' : 'text-left';
};

/**
 * Returns the appropriate list style position class based on the current locale
 * @param locale The current locale
 * @returns Tailwind list style position class
 */
export const getListStyleClass = (locale: string): string => {
  return locale === 'ar' ? 'rtl-list' : '';
};

/**
 * Returns the appropriate margin class for list items based on the current locale
 * @param locale The current locale
 * @returns Tailwind margin class
 */
export const getListMarginClass = (locale: string): string => {
  return locale === 'ar' ? 'mr-5' : 'ml-5';
};

/**
 * Returns the appropriate flex direction class based on the current locale
 * @param locale The current locale
 * @returns Tailwind flex direction class
 */
export const getFlexDirectionClass = (locale: string): string => {
  return locale === 'ar' ? 'flex-row-reverse' : 'flex-row';
};

/**
 * Returns the appropriate icon margin class based on the current locale
 * @param locale The current locale
 * @returns Tailwind margin class for icons
 */
export const getIconMarginClass = (locale: string): string => {
  return locale === 'ar' ? 'ml-3' : 'mr-3';
};

/**
 * Returns the appropriate padding class based on the current locale
 * @param locale The current locale
 * @returns Tailwind padding class
 */
export const getPaddingClass = (locale: string): string => {
  return locale === 'ar' ? 'pl-4 pr-0' : 'pr-4 pl-0';
};

/**
 * Returns the appropriate margin class based on the current locale
 * @param locale The current locale
 * @param side The side of the margin in LTR mode
 * @returns Tailwind margin class
 */
export const getMarginClass = (locale: string, side: 'left' | 'right'): string => {
  if (side === 'left') {
    return locale === 'ar' ? 'mr-auto' : 'ml-auto';
  } else {
    return locale === 'ar' ? 'ml-auto' : 'mr-auto';
  }
};

/**
 * Returns the appropriate order class based on the current locale
 * @param locale The current locale
 * @param order The order value in LTR mode
 * @returns Tailwind order class
 */
export const getOrderClass = (locale: string, order: number): string => {
  return locale === 'ar' ? `order-${Math.abs(order - 12)}` : `order-${order}`;
};

/**
 * Returns the appropriate grid column start class based on the current locale
 * @param locale The current locale
 * @param start The column start value in LTR mode
 * @param end The column end value in LTR mode
 * @returns Tailwind grid column class
 */
export const getGridColumnClass = (locale: string, start: number, end: number): string => {
  if (locale === 'ar') {
    // Reverse the column positions for RTL
    const newStart = 13 - end;
    const newEnd = 13 - start;
    return `col-start-${newStart} col-end-${newEnd}`;
  }
  return `col-start-${start} col-end-${end}`;
};

/**
 * Returns the appropriate border class based on the current locale
 * @param locale The current locale
 * @param side The side of the border in LTR mode
 * @returns Tailwind border class
 */
export const getBorderClass = (locale: string, side: 'left' | 'right'): string => {
  if (side === 'left') {
    return locale === 'ar' ? 'border-r' : 'border-l';
  } else {
    return locale === 'ar' ? 'border-l' : 'border-r';
  }
};

/**
 * Returns the appropriate rounded corner class based on the current locale
 * @param locale The current locale
 * @param corner The corner in LTR mode
 * @returns Tailwind rounded corner class
 */
export const getRoundedClass = (locale: string, corner: 'tl' | 'tr' | 'bl' | 'br'): string => {
  if (locale === 'ar') {
    switch (corner) {
      case 'tl': return 'rounded-tr';
      case 'tr': return 'rounded-tl';
      case 'bl': return 'rounded-br';
      case 'br': return 'rounded-bl';
    }
  }
  
  switch (corner) {
    case 'tl': return 'rounded-tl';
    case 'tr': return 'rounded-tr';
    case 'bl': return 'rounded-bl';
    case 'br': return 'rounded-br';
  }
};

/**
 * Returns the appropriate text direction class based on the current locale
 * @param locale The current locale
 * @returns Text direction class
 */
export const getTextDirectionClass = (locale: string): string => {
  return locale === 'ar' ? 'rtl-text' : '';
};

/**
 * Returns a complete set of RTL utility classes for a component
 * @param locale The current locale
 * @returns Object containing all RTL utility classes
 */
export const getRTLClasses = (locale: string) => {
  return {
    textAlign: getTextAlignClass(locale),
    listStyle: getListStyleClass(locale),
    flexDirection: getFlexDirectionClass(locale),
    iconMargin: getIconMarginClass(locale),
    listMargin: getListMarginClass(locale),
    textDirection: getTextDirectionClass(locale),
  };
}; 