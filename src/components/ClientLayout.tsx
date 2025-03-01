"use client";

import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { I18nProvider } from "@/lib/i18n/client";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <I18nProvider>
        {children}
        <ToastContainer />
      </I18nProvider>
    </SessionProvider>
  );
} 