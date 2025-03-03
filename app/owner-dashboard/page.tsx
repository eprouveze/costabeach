"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerDashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the French locale version
    router.replace("/fr/owner-dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Redirecting to owner dashboard...</p>
    </div>
  );
} 