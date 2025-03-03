"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerLoginPageAr() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new auth page in Arabic locale
    router.replace("/ar/auth/signin");
  }, [router]);

  // Return a simple loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">جارٍ إعادة التوجيه إلى صفحة تسجيل الدخول...</p>
    </div>
  );
} 