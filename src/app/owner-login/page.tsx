"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new auth page
    router.replace("/auth/signin");
  }, [router]);

  // Return a simple loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Redirecting to login page...</p>
    </div>
  );
} 