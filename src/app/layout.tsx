import React from "react";
import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { TRPCReactProvider } from "@/lib/trpc/react";
import { Metadata } from "next";
import ClientProvider from "@/components/ClientProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeAwareToast } from "@/components/theme/ThemeAwareToast";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Costa Beach Owner Portal",
  description: "Secure access to Costa Beach condo resources and documents",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider defaultTheme="system" enableSystem>
            <ClientProvider>
              <TRPCReactProvider>
                <div className="min-h-screen relative">
                  {/* Auth Navigation */}
                  <nav className="absolute top-0 right-0 left-0 z-50 p-4 flex justify-end">
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900">
                          Sign In
                        </button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <UserButton 
                        appearance={{
                          elements: {
                            userButtonBox: "hover:opacity-80 transition-opacity",
                            userButtonTrigger: "rounded-lg focus:shadow-none",
                            userButtonPopoverCard: "rounded-lg dark:bg-neutral-800 dark:border-neutral-700",
                            userPreviewMainIdentifier: "dark:text-white",
                            userPreviewSecondaryIdentifier: "dark:text-neutral-400",
                          }
                        }}
                        afterSignOutUrl="/"
                        signInUrl="/owner-login"
                      />
                    </SignedIn>
                  </nav>

                  {/* Main Content */}
                  <main className="relative">
                    {children}
                  </main>

                  <ThemeAwareToast />
                </div>
              </TRPCReactProvider>
            </ClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
