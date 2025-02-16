"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/shared";

interface IconProps {
  icon: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: string;
}

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

const Icon = ({
  icon: IconComponent,
  size = "md",
  className,
  color,
  ...props
}: IconProps) => {
  return (
    <IconComponent
      size={sizeMap[size]}
      className={cn("flex-shrink-0", className)}
      color={color}
      {...props}
    />
  );
};

export default Icon; 