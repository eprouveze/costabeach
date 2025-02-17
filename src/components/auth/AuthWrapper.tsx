"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function AuthWrapper({ children, requireAuth = false, allowedRoles = [] }: AuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/owner-login");
    }
    // Add role check if needed in the future
  }, [requireAuth, status, router]);

  if (requireAuth && status === "loading") {
    return <div>Loading...</div>;
  }

  if (requireAuth && !session) {
    return null;
  }

  return <>{children}</>;
} 