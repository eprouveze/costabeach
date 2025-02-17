"use client";

import React from "react";
import { SignIn } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OwnerLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <Link
        href="/"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
              Owner Portal
            </span>
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            Sign in to access your documents and resources
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-800/50 p-8 shadow-xl">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-sm normal-case shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30",
                card: "shadow-none bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: 
                  "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white text-sm normal-case",
                formFieldInput: 
                  "rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-sm dark:bg-neutral-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400",
                footer: "hidden"
              },
            }}
          />

          <div className="mt-6">
            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              By signing in, you agree to our{" "}
              <Link
                href="/privacy"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 