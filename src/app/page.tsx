import React from "react";
import ClientProvider from "@/components/ClientProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/index";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicLandingTemplate from "@/components/PublicLandingTemplate";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";

export const dynamic = "force-dynamic";

async function getSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

export default async function Page() {
  const session = await getSession();

  return (
    <ClientProvider>
      <main className="flex flex-col min-h-screen">
        {/* Add debug links for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50">
            <Link 
              href="/api/debug" 
              className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Debug API
            </Link>
            <Link 
              href="/api/trpc-test" 
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-500"
            >
              tRPC Test
            </Link>
          </div>
        )}

        {/* Rest of your page content */}
        <main className="flex-1 flex flex-col w-full mx-auto">
          <ClientProvider>
            <div className="flex-1 flex items-start justify-center  bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
              {session ? (
                // Authenticated View
                <section className="max-w-7xl w-full space-y-8 animate-fade-in">
                  <h1> Welcome {session.user?.name}</h1>
                </section>
              ) : (
                // Marketing View
                <section className="max-w-7xl w-full space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <h1 className="text-4xl font-bold mt-10">
                      Welcome - Click the button below to get started
                    </h1>
                    <Link
                      href="/auth/signin"
                      className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg px-8 py-4 text-lg font-medium shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      Get Started
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </section>
              )}
            </div>
          </ClientProvider>
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              © {new Date().getFullYear()} All Rights Reserved
            </span>
            <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <Link
                href="/privacy"
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </ClientProvider>
  );
}
