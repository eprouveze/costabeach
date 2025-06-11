'use client';

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/shared";

interface FlowButtonProps {
  text?: string;
  variant?: "default" | "gradient" | "wave";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const FlowButton = React.forwardRef<HTMLButtonElement, FlowButtonProps>(
  ({ text = "Flow Button", variant = "default", className, onClick, disabled, type = "button" }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const variants = {
      default: {
        base: "relative overflow-hidden rounded-full border-2 border-foreground/20 bg-background px-8 py-3 text-foreground transition-all duration-500 hover:border-transparent hover:text-background",
        flow: "absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-all duration-500 group-hover:opacity-100",
      },
      gradient: {
        base: "relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 px-8 py-3 text-foreground backdrop-blur-sm transition-all duration-700",
        flow: "absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-0 transition-all duration-700 group-hover:opacity-100",
      },
      wave: {
        base: "relative overflow-hidden rounded-2xl border border-border bg-background/50 px-8 py-3 text-foreground backdrop-blur-sm transition-all duration-600",
        flow: "absolute inset-0 rounded-2xl opacity-0 transition-all duration-600 group-hover:opacity-100",
      },
    };

    const currentVariant = variants[variant];

    return (
      <motion.button
        ref={ref}
        className={cn(
          "group inline-flex items-center justify-center gap-2 font-semibold",
          currentVariant.base,
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {/* Flow Background */}
        <motion.div
          className={currentVariant.flow}
          initial={{ x: "-100%" }}
          animate={isHovered ? { x: "0%" } : { x: "-100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {variant === "wave" && (
            <motion.div
              className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"
              animate={{
                background: [
                  "linear-gradient(45deg, #10b981, #14b8a6, #3b82f6)",
                  "linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)",
                  "linear-gradient(45deg, #ec4899, #f59e0b, #10b981)",
                  "linear-gradient(45deg, #10b981, #14b8a6, #3b82f6)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>

        {/* Ripple Effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={isHovered ? { scale: 1.5, opacity: 0 } : { scale: 0, opacity: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: variant === "gradient" 
              ? "radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
          }}
        />

        {/* Left Arrow */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={isHovered ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative z-10"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
        </motion.div>

        {/* Text */}
        <motion.span
          className="relative z-10 transition-all duration-300 group-hover:text-white"
          animate={isHovered ? { x: 4 } : { x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {text}
        </motion.span>

        {/* Right Arrow */}
        <motion.div
          initial={{ x: 0 }}
          animate={isHovered ? { x: 4 } : { x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative z-10"
        >
          <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:text-white" />
        </motion.div>

        {/* Floating Particles */}
        {isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-white/60"
                initial={{
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 20 - 10,
                  opacity: 0,
                }}
                animate={{
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 40 - 20,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </motion.button>
    );
  }
);

FlowButton.displayName = "FlowButton";

export { FlowButton };
export type { FlowButtonProps }; 