"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/shared";

interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "base" | "lg";
  variant?: "default" | "muted" | "info" | "success" | "warning" | "error";
  weight?: "normal" | "medium" | "semibold";
  leading?: "none" | "tight" | "normal" | "relaxed" | "loose";
}

const sizeStyles = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

const variantStyles = {
  default: "text-gray-900",
  muted: "text-gray-500",
  info: "text-blue-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
};

const weightStyles = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
};

const leadingStyles = {
  none: "leading-none",
  tight: "leading-tight",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
};

const Paragraph = ({
  size = "base",
  variant = "default",
  weight = "normal",
  leading = "normal",
  className,
  children,
  ...props
}: ParagraphProps) => {
  return (
    <p
      className={cn(
        sizeStyles[size],
        variantStyles[variant],
        weightStyles[weight],
        leadingStyles[leading],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

export default Paragraph; 