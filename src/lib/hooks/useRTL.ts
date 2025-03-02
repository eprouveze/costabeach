"use client";

import { useI18n } from "@/lib/i18n/client";
import {
  getTextAlignClass,
  getListStyleClass,
  getFlexDirectionClass,
  getIconMarginClass,
  getListMarginClass,
  getTextDirectionClass,
  getPaddingClass,
  getMarginClass,
  getOrderClass,
  getGridColumnClass,
  getBorderClass,
  getRoundedClass,
  getRTLClasses
} from "@/lib/utils/rtl";

/**
 * A hook that provides RTL utilities
 * @returns An object containing RTL utility functions and classes
 */
export function useRTL() {
  const { locale } = useI18n();
  const isRTL = locale === 'ar';
  
  return {
    isRTL,
    locale,
    classes: getRTLClasses(locale),
    getTextAlignClass: () => getTextAlignClass(locale),
    getListStyleClass: () => getListStyleClass(locale),
    getFlexDirectionClass: () => getFlexDirectionClass(locale),
    getIconMarginClass: () => getIconMarginClass(locale),
    getListMarginClass: () => getListMarginClass(locale),
    getTextDirectionClass: () => getTextDirectionClass(locale),
    getPaddingClass: () => getPaddingClass(locale),
    getMarginClass: (side: 'left' | 'right') => getMarginClass(locale, side),
    getOrderClass: (order: number) => getOrderClass(locale, order),
    getGridColumnClass: (start: number, end: number) => getGridColumnClass(locale, start, end),
    getBorderClass: (side: 'left' | 'right') => getBorderClass(locale, side),
    getRoundedClass: (corner: 'tl' | 'tr' | 'bl' | 'br') => getRoundedClass(locale, corner),
    
    // Helper functions for common patterns
    getContentClass: (includeTextAlign = true, includeTextDirection = true) => {
      let className = '';
      if (includeTextAlign) className += ` ${getTextAlignClass(locale)}`;
      if (includeTextDirection) className += ` ${getTextDirectionClass(locale)}`;
      return className.trim();
    },
    
    getFlexClass: (includeDirection = true, includeAlign = false) => {
      let className = 'flex';
      if (includeDirection) className += ` ${getFlexDirectionClass(locale)}`;
      if (includeAlign && isRTL) className += ' items-end';
      return className;
    },
    
    getGridClass: (columns: number) => {
      return `grid grid-cols-${columns} ${isRTL ? 'rtl-grid' : ''}`;
    },
    
    // Direction-aware style objects for inline styles
    getStyle: () => {
      return isRTL
        ? { direction: 'rtl', textAlign: 'right' }
        : { direction: 'ltr', textAlign: 'left' };
    },
    
    // Direction-aware transform for icons
    getIconTransform: () => {
      return isRTL ? 'transform-flip-x' : '';
    }
  };
} 