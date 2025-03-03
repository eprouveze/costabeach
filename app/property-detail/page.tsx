"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PropertyDetailRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the French locale version
    router.replace("/fr/property-detail");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Redirecting to property detail page...</p>
    </div>
  );
} 