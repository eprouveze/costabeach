"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/client";

interface RTLTextProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * A specialized component for RTL-aware text content
 * This component ensures proper punctuation positioning for Arabic text
 */
export default function RTLText({
  children,
  className = "",
  as: Component = "p",
}: RTLTextProps) {
  const { locale } = useI18n();
  const isRTL = locale === 'ar';
  
  // Build the className string
  let classNames = className;
  
  // Add RTL-specific classes for text direction and punctuation
  if (isRTL) {
    classNames += " rtl-text";
    
    // Add text alignment if not already specified
    if (!className.includes("text-")) {
      classNames += " text-right";
    }
  } else {
    // Add text alignment if not already specified
    if (!className.includes("text-")) {
      classNames += " text-left";
    }
  }
  
  return <Component className={classNames}>{children}</Component>;
} 