"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/client";
import { getRTLClasses } from "@/lib/utils/rtl";

interface RTLWrapperProps {
  children: React.ReactNode;
  className?: string;
  applyTextAlign?: boolean;
  applyFlexDirection?: boolean;
  applyTextDirection?: boolean;
  applyListStyle?: boolean;
  as?: React.ElementType;
}

/**
 * A wrapper component that applies RTL utilities to its children
 * This can be used to wrap any content that needs RTL support
 */
export default function RTLWrapper({
  children,
  className = "",
  applyTextAlign = true,
  applyFlexDirection = false,
  applyTextDirection = true,
  applyListStyle = false,
  as: Component = "div",
}: RTLWrapperProps) {
  const { locale } = useI18n();
  const rtlClasses = getRTLClasses(locale);
  const isRTL = locale === 'ar';
  
  // Build the className string based on the props
  let classNames = className;
  
  if (applyTextAlign) {
    classNames += ` ${rtlClasses.textAlign}`;
  }
  
  if (applyFlexDirection) {
    classNames += ` ${rtlClasses.flexDirection}`;
  }
  
  if (applyTextDirection) {
    classNames += ` ${rtlClasses.textDirection}`;
  }
  
  // Apply list style classes specifically for ul and ol elements
  if (Component === 'ul' || Component === 'ol' || applyListStyle) {
    classNames += ` ${rtlClasses.listStyle}`;
    
    // Add padding for RTL lists
    if (isRTL) {
      classNames += ' pr-5 pl-0';
    } else {
      classNames += ' pl-5 pr-0';
    }
  }
  
  return <Component className={classNames}>{children}</Component>;
} 