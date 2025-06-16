"use client";

import { ThemeProvider as NextThemeProvider, ThemeProviderProps as NextThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: NextThemeProviderProps) {
  return (
    <NextThemeProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="costa-beach-theme"
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
