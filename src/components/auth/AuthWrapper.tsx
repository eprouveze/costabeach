"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { toast } from "react-toastify";

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export const AuthWrapper = ({
  children,
  requireAuth = true,
  allowedRoles = [],
}: AuthWrapperProps) => {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (requireAuth && !sessionId) {
      toast.error("Please sign in to access this page");
      router.push("/sign-in");
      return;
    }

    // Role-based access can be implemented here if needed
    // For now, we'll just check if authentication is required
  }, [isLoaded, sessionId, requireAuth, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}; 