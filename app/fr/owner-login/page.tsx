"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerLoginPageFr() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new auth page in French locale
    router.replace("/fr/auth/signin");
  }, [router]);

  // Return a simple loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Redirection vers la page de connexion...</p>
    </div>
  );
} 