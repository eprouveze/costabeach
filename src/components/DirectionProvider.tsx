"use client";

import { useI18n } from "@/lib/i18n/client";
import { useEffect } from "react";

interface DirectionProviderProps {
  children: React.ReactNode;
}

/**
 * A client component that sets the HTML dir attribute based on the current locale
 */
export default function DirectionProvider({ children }: DirectionProviderProps) {
  const { locale } = useI18n();
  const isRTL = locale === 'ar';

  useEffect(() => {
    // Set the dir attribute on the html element
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [isRTL]);

  return <>{children}</>;
} 