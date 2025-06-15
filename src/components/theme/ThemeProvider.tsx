"use client";

import { ThemeProvider as NextThemeProvider, ThemeProviderProps as NextThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: NextThemeProviderProps) {
  return (
    <NextThemeProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      suppressColorSchemeWarning
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
