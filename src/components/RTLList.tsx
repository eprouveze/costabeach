"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/client";
import { getListStyleClass } from "@/lib/utils/rtl";

interface RTLListProps {
  children: React.ReactNode;
  className?: string;
  type?: "ul" | "ol";
  listStyleType?: "disc" | "decimal" | "circle" | "square" | "none";
}

/**
 * A specialized component for RTL-aware lists
 * This component handles proper RTL styling for lists including bullet positioning
 */
export default function RTLList({
  children,
  className = "",
  type = "ul",
  listStyleType = "disc",
}: RTLListProps) {
  const { locale } = useI18n();
  const isRTL = locale === 'ar';
  const rtlListClass = getListStyleClass(locale);
  
  // Build the className string
  let classNames = className;
  
  // Add RTL-specific classes
  if (rtlListClass) {
    classNames += ` ${rtlListClass}`;
  }
  
  // Add padding based on direction
  if (isRTL) {
    classNames += ' pr-5 pl-0';
  } else {
    classNames += ' pl-5 pr-0';
  }
  
  // Add list style type
  if (listStyleType !== 'none') {
    classNames += ` list-${listStyleType}`;
  }
  
  // Render the appropriate list element
  if (type === "ol") {
    return <ol className={classNames}>{children}</ol>;
  }
  
  return <ul className={classNames}>{children}</ul>;
} 