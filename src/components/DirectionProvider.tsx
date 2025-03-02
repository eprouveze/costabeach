"use client";

import { useI18n } from "@/lib/i18n/client";
import { useEffect } from "react";

interface DirectionProviderProps {
  children: React.ReactNode;
}

/**
 * A client component that sets the HTML dir attribute based on the current locale
 * This component should be used at the root of the application to ensure proper RTL support
 */
export default function DirectionProvider({ children }: DirectionProviderProps) {
  const { locale } = useI18n();
  const isRTL = locale === 'ar';

  useEffect(() => {
    // Set the dir attribute on the html element
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    
    // Add or remove a class to the body for additional RTL styling
    if (isRTL) {
      document.body.classList.add('rtl-layout');
    } else {
      document.body.classList.remove('rtl-layout');
    }
    
    // Set text alignment on the body
    if (isRTL) {
      document.body.style.textAlign = 'right';
    } else {
      document.body.style.textAlign = 'left';
    }
    
    // Clean up function
    return () => {
      document.body.classList.remove('rtl-layout');
      document.body.style.textAlign = '';
    };
  }, [isRTL]);

  return <>{children}</>;
} 