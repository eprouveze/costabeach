"use client";

import React, { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut({ 
          callbackUrl: "/fr",
          redirect: false 
        });
        router.push("/fr");
      } catch (error) {
        console.error("Sign out error:", error);
        router.push("/fr");
      }
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Déconnexion en cours...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandBlue-600 mx-auto"></div>
      </div>
    </div>
  );
}