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