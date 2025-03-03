"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the src/app auth signup page
    router.push("/fr/auth/signup");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg">Redirecting to sign-up page...</p>
    </div>
  );
} 