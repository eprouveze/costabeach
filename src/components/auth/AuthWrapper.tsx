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
  const { isLoaded, userId, sessionId, getToken, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (requireAuth && !sessionId) {
      toast.error("Please sign in to access this page");
      router.push("/sign-in");
      return;
    }

    if (
      allowedRoles.length > 0 &&
      user?.publicMetadata?.role &&
      !allowedRoles.includes(user.publicMetadata.role as string)
    ) {
      toast.error("You don't have permission to access this page");
      router.push("/");
      return;
    }
  }, [isLoaded, sessionId, requireAuth, allowedRoles, router, user]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}; 