"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct sign-in page
    router.push("/src/app/auth/signin");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Redirecting to sign-in page...</p>
    </div>
  );
} 