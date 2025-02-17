import React from "react";
import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { TRPCReactProvider } from "@/lib/trpc/react";
import { Metadata } from "next";
import ClientProvider from "@/components/ClientProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeAwareToast } from "@/components/theme/ThemeAwareToast";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Costa Beach Owner Portal",
  description: "Secure access to Costa Beach condo resources and documents",
  icons: {
    icon: "/favicon.ico",
  },
};

function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
      >
        Sign Out
      </button>
    );
  }
  return (
    <button
      onClick={() => signIn()}
      className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
    >
      Sign In
    </button>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider defaultTheme="system" enableSystem>
            <ClientProvider>
              <TRPCReactProvider>
                <div className="min-h-screen relative">
                  <nav className="absolute top-0 right-0 left-0 z-50 p-4 flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                      Costa Beach
                    </Link>
                    <div className="flex items-center gap-4">
                      <AuthButton />
                    </div>
                  </nav>
                  {children}
                </div>
                <ThemeAwareToast />
              </TRPCReactProvider>
            </ClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
