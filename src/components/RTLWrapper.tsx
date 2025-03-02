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
}: RTLWrapperProps) {
  const { locale } = useI18n();
  const rtlClasses = getRTLClasses(locale);
  
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
  
  if (applyListStyle) {
    classNames += ` ${rtlClasses.listStyle}`;
  }
  
  return <div className={classNames}>{children}</div>;
} 