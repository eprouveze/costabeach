"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { I18nProvider } from "@/lib/i18n/client";
import { TRPCReactProvider } from "@/lib/trpc";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeAwareToast } from "@/components/theme/ThemeAwareToast";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <TRPCReactProvider>
          <I18nProvider>
            {children}
            <ThemeAwareToast />
          </I18nProvider>
        </TRPCReactProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
