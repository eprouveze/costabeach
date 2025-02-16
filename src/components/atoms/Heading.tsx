"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/shared";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: HeadingSize;
  weight?: "normal" | "medium" | "semibold" | "bold";
}

const sizeStyles: Record<HeadingSize, string> = {
  xs: "text-lg",
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
  "2xl": "text-5xl",
};

const weightStyles = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const Heading = ({
  level = "h2",
  size = "md",
  weight = "semibold",
  className,
  children,
  ...props
}: HeadingProps) => {
  const Tag = level;

  return (
    <Tag
      className={cn(
        "text-gray-900 tracking-tight",
        sizeStyles[size],
        weightStyles[weight],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Heading; 